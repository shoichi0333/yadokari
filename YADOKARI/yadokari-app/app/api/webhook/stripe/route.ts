import { NextRequest, NextResponse } from "next/server";
import { PlanType } from "@prisma/client";
import Stripe from "stripe";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getStripeId(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription): Date {
  const currentPeriodEnd = (subscription as Stripe.Subscription & { current_period_end?: number }).current_period_end;

  if (!currentPeriodEnd) {
    throw new Error(`Subscription ${subscription.id} does not include current_period_end`);
  }

  return new Date(currentPeriodEnd * 1000);
}

function parsePlanType(value: string | undefined): PlanType | null {
  if (value === PlanType.STANDARD || value === PlanType.PRO) {
    return value;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !stripeWebhookSecret || !process.env.DATABASE_URL) {
    console.log("Stripe webhook skipped: Stripe or database settings are not configured");
    return NextResponse.json({ mock: true });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook signature error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripeCustomerId = getStripeId(session.customer);
        const stripeSubscriptionId = getStripeId(session.subscription);
        const planType = parsePlanType(session.metadata?.planType);
        const email = session.customer_email;

        if (!stripeCustomerId || !stripeSubscriptionId || !planType || !email) {
          console.log("Stripe checkout session missing required data", {
            sessionId: session.id,
            hasCustomer: Boolean(stripeCustomerId),
            hasSubscription: Boolean(stripeSubscriptionId),
            planType: session.metadata?.planType,
            hasEmail: Boolean(email),
          });
          break;
        }

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            stripeCustomerId,
            plan: planType,
          },
          create: {
            email,
            name: email.split("@")[0] || "YADOKARI User",
            stripeCustomerId,
            plan: planType,
          },
        });

        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

        await prisma.subscription.upsert({
          where: { stripeSubscriptionId },
          create: {
            userId: user.id,
            plan: planType,
            stripeSubscriptionId,
            status: subscription.status,
            currentPeriodEnd: getCurrentPeriodEnd(subscription),
          },
          update: {
            userId: user.id,
            plan: planType,
            status: subscription.status,
            currentPeriodEnd: getCurrentPeriodEnd(subscription),
          },
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const planType = parsePlanType(subscription.metadata?.planType);

        const result = await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            ...(planType ? { plan: planType } : {}),
            status: subscription.status,
            currentPeriodEnd: getCurrentPeriodEnd(subscription),
          },
        });

        if (result.count === 0) {
          console.log("Stripe subscription update skipped: subscription not found", {
            stripeSubscriptionId: subscription.id,
          });
        } else if (planType) {
          const storedSubscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
          });

          if (storedSubscription) {
            await prisma.user.update({
              where: { id: storedSubscription.userId },
              data: { plan: planType },
            });
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const storedSubscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!storedSubscription) {
          console.log("Stripe subscription delete skipped: subscription not found", {
            stripeSubscriptionId: subscription.id,
          });
          break;
        }

        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: "canceled" },
        });

        await prisma.user.update({
          where: { id: storedSubscription.userId },
          data: { plan: PlanType.FREE },
        });

        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler failed", error);
    return NextResponse.json({ error: "Stripe webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
