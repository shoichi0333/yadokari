"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { normalizePlanId, setCurrentPlan } from "@/lib/plan";
import {
  ArrowRight,
  Bell,
  Check,
  Crown,
  Heart,
  HelpCircle,
  Mail,
  Map,
  Search,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react";

type PaidPlanId = "standard" | "pro";

type Plan = {
  id: "free" | PaidPlanId;
  name: string;
  description: string;
  price: string;
  features: string[];
  buttonLabel: string;
  highlighted?: boolean;
  priceId?: string;
};

type PricingClientProps = {
  checkoutAvailable: boolean;
  standardPriceId?: string;
  proPriceId?: string;
};

function getPlans({ standardPriceId, proPriceId }: Pick<PricingClientProps, "standardPriceId" | "proPriceId">): Plan[] {
  return [
    {
      id: "free",
      name: "フリー",
      description: "民泊投資の初期調査をすぐに始めたい方向け。",
      price: "0円",
      buttonLabel: "無料で始める",
      features: ["物件検索", "民泊可否チェック", "届出住宅マップ"],
    },
    {
      id: "standard",
      name: "スタンダード",
      description: "候補物件を継続的に追い、収益性まで見極めたい方向け。",
      price: "2,980円",
      buttonLabel: "プランを選択",
      highlighted: true,
      priceId: standardPriceId,
      features: ["フリー全機能", "お気に入り無制限", "詳細エリアレポート", "収益シミュレーター詳細", "メール通知"],
    },
    {
      id: "pro",
      name: "プロ（エージェント向け）",
      description: "掲載、問い合わせ対応、顧客提案まで一元管理したい事業者向け。",
      price: "9,800円",
      buttonLabel: "プランを選択",
      priceId: proPriceId,
      features: ["スタンダード全機能", "物件掲載（5件まで）", "問い合わせ管理", "提案用レポート", "優先サポート"],
    },
  ];
}

const faqs = [
  {
    question: "いつでも解約できますか？",
    answer: "はい。契約期間の縛りはなく、いつでも次回更新前に解約できます。",
  },
  {
    question: "フリープランでも物件検索は使えますか？",
    answer: "はい。物件検索、民泊可否チェック、届出住宅マップは無料で利用できます。",
  },
  {
    question: "プロプランは誰向けですか？",
    answer: "民泊可能物件を掲載したい不動産会社、エージェント、運用代行事業者向けです。",
  },
];

const featureIcons = [
  { icon: Search, label: "物件検索" },
  { icon: Shield, label: "法規制チェック" },
  { icon: Map, label: "届出住宅マップ" },
  { icon: TrendingUp, label: "収益分析" },
  { icon: Bell, label: "通知" },
  { icon: Mail, label: "問い合わせ管理" },
];

export default function PricingClient({
  checkoutAvailable,
  standardPriceId,
  proPriceId,
}: PricingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<PaidPlanId | null>(null);
  const plans = getPlans({ standardPriceId, proPriceId });
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const source = searchParams.get("source");
  const reportAddress = searchParams.get("address") ?? "";
  const cameFromReport = source === "report";
  const cameFromDashboard = source === "dashboard";

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      setCurrentPlan(normalizePlanId(searchParams.get("plan")));
      router.replace("/pricing");
    }
  }, [searchParams, router]);

  async function handleCheckout(plan: Plan) {
    if (!checkoutAvailable || !plan.priceId) {
      alert("準備中です");
      return;
    }

    try {
      setLoadingPlan(plan.id as PaidPlanId);
      const origin = window.location.origin;
      const reportPath = reportAddress
        ? `/report?address=${encodeURIComponent(reportAddress)}`
        : "/report";
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan.priceId,
          planType: plan.id === "standard" ? "STANDARD" : "PRO",
          successUrl: `${origin}${
            cameFromReport
              ? `${reportPath}&checkout=success&plan=${plan.id}`
              : `/pricing?checkout=success&plan=${plan.id}`
          }`,
          cancelUrl: `${origin}${cameFromReport ? reportPath : "/pricing?checkout=cancel"}`,
          email: user?.email,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        alert(data.error ?? "準備中です");
        return;
      }

      window.location.assign(data.url);
    } catch {
      alert("準備中です");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <Crown size={14} />
            民泊投資の調査から運用判断まで
          </div>
          <h1 className="mx-auto max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            YADOKARIで民泊投資を加速させよう
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-teal-50 sm:text-lg">
            物件検索、民泊可否チェック、競合調査、収益シミュレーション、詳細レポートをひとつに。投資判断に必要な情報をすばやく整理できます。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {featureIcons.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white"
              >
                <Icon size={14} />
                {label}
              </span>
            ))}
          </div>
          {(cameFromReport || cameFromDashboard) && (
            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur-sm">
              <p className="text-sm font-bold text-white">
                {cameFromReport ? "詳細レポートの続きへ" : "ダッシュボード機能を拡張"}
              </p>
              <p className="mt-1 text-sm leading-6 text-teal-50">
                {cameFromReport
                  ? `${reportAddress ? `${reportAddress} の` : ""}無料レポートを、実質利益・初期費用・実務チェックリストまで拡張できます。`
                  : "詳細レポート、履歴活用、通知、収益分析を使って候補住所の検討を継続できます。"}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            目的に合わせて選べる3つのプラン
          </h2>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            まずは無料で始めて、必要なタイミングで有料機能を追加できます。
          </p>
          {!checkoutAvailable && (
            <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
              有料プランの決済は現在準備中です。無料プランの登録と基本機能はそのまま利用できます。
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={[
                "relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all",
                plan.highlighted
                  ? "border-teal-500 shadow-xl shadow-teal-900/10 ring-1 ring-teal-500"
                  : "border-gray-100 hover:border-teal-200 hover:shadow-md",
              ].join(" ")}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-teal-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-teal-900/20">
                  <Star size={12} fill="currentColor" />
                  人気
                </div>
              )}

              <div className="flex flex-1 flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-relaxed text-gray-500">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                  <span className="ml-1 text-sm font-medium text-gray-500">/月</span>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <Check size={13} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.id === "free" ? (
                  <Link
                    href="/auth/register"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    {plan.buttonLabel}
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => void handleCheckout(plan)}
                      disabled={!checkoutAvailable || !plan.priceId || loadingPlan === plan.id}
                      className={[
                        "flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70",
                        !checkoutAvailable || !plan.priceId
                          ? "border border-gray-200 bg-gray-100 text-gray-400"
                          : plan.highlighted
                            ? "bg-teal-600 text-white hover:bg-teal-700"
                            : "border border-gray-200 bg-white text-gray-900 hover:border-teal-300 hover:text-teal-700",
                      ].join(" ")}
                    >
                      {loadingPlan === plan.id ? "処理中..." : checkoutAvailable && plan.priceId ? plan.buttonLabel : "準備中"}
                      <ArrowRight size={16} />
                    </button>
                    {(!checkoutAvailable || !plan.priceId) && (
                      <p className="mt-2 text-center text-xs text-gray-400">
                        決済設定が完了すると選択できます。
                      </p>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <HelpCircle size={22} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">よくある質問</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Heart size={14} className="text-rose-400" />
            まずは無料プランから、YADOKARIの基本機能をお試しください。
          </div>
        </div>
      </section>
    </main>
  );
}
