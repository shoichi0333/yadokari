import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { cleanEnvValue, getExpectedStripePriceId, isAllowedAppUrl } from "@/lib/config";

type CheckoutRequestBody = {
  priceId?: string;
  planType?: "STANDARD" | "PRO";
  successUrl?: string;
  cancelUrl?: string;
  email?: string;
};

export async function POST(request: NextRequest) {
  const stripeSecretKey = cleanEnvValue(process.env.STRIPE_SECRET_KEY);

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "Stripe secret key is not configured", mock: true },
      { status: 503 }
    );
  }

  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { planType, successUrl, cancelUrl, email } = body;
  const priceId = cleanEnvValue(body.priceId);

  if (!priceId || !planType || !successUrl || !cancelUrl) {
    return NextResponse.json(
      { error: "priceId, planType, successUrl, and cancelUrl are required" },
      { status: 400 }
    );
  }

  if (planType !== "STANDARD" && planType !== "PRO") {
    return NextResponse.json({ error: "planType must be STANDARD or PRO" }, { status: 400 });
  }

  const expectedPriceId = getExpectedStripePriceId(planType);
  if (!expectedPriceId || priceId !== expectedPriceId) {
    return NextResponse.json({ error: "Invalid priceId for selected plan" }, { status: 400 });
  }

  if (!isAllowedAppUrl(successUrl) || !isAllowedAppUrl(cancelUrl)) {
    return NextResponse.json({ error: "Invalid checkout return URL" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { planType },
      subscription_data: {
        metadata: { planType },
      },
      customer_email: email ?? undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create Stripe checkout session:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
