import type { Metadata } from "next";
import { Suspense } from "react";
import PricingClient from "./PricingClient";
import { cleanEnvValue } from "@/lib/config";

export const metadata: Metadata = {
  title: "料金プラン | YADOKARI",
  description: "YADOKARIの料金プラン。無料・スタンダード・プロの3プランから選べます。民泊可否チェッカー・届出マップ・収益シミュレーター搭載。",
  openGraph: {
    title: "料金プラン | YADOKARI",
    description: "YADOKARIの料金プラン。民泊投資に必要な情報をすべて揃えた3プランをご用意しています。",
    type: "website",
  },
};

export default function PricingPage() {
  const publishableKeyAvailable = Boolean(
    process.env.STRIPE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
  const secretKeyAvailable = Boolean(process.env.STRIPE_SECRET_KEY);
  const standardPriceId = cleanEnvValue(
    process.env.STRIPE_STANDARD_PRICE_ID ?? process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID
  );
  const proPriceId = cleanEnvValue(process.env.STRIPE_PRO_PRICE_ID ?? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID);

  return (
    <Suspense>
      <PricingClient
        checkoutAvailable={publishableKeyAvailable && secretKeyAvailable}
        standardPriceId={standardPriceId}
        proPriceId={proPriceId}
      />
    </Suspense>
  );
}
