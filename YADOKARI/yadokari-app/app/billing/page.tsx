import type { Metadata } from "next";
import BillingClient from "./BillingClient";

export const metadata: Metadata = {
  title: "プラン・課金管理 | YADOKARI",
  description: "現在のプランの確認・変更・解約ができます。",
};

export default function BillingPage() {
  return <BillingClient />;
}
