"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Crown, ExternalLink, RefreshCcw } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { PLAN_LABELS, type PlanId } from "@/lib/plan";
import { getAuthFetchHeaders } from "@/lib/authFetch";

type BillingInfo = {
  plan: PlanId;
  subscription: {
    status: string;
    plan: string;
    currentPeriodEnd: string;
  } | null;
};

const STATUS_LABELS: Record<string, string> = {
  active: "有効",
  canceled: "解約済み",
  past_due: "支払い遅延",
  unpaid: "未払い",
  trialing: "トライアル中",
};

const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: ["可否チェック 3回/日", "履歴3件", "基本シミュレーター"],
  standard: ["可否チェック 100回/日", "履歴50件", "詳細レポート保存50件", "YADOKARI物件分析", "詳細地図（フィルター・比較・PDF）"],
  pro: ["可否チェック 無制限", "履歴・レポート無制限", "物件掲載申請（5件）", "全機能", "優先サポート"],
};

export default function BillingClient() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login?redirect=/billing");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;
    void getAuthFetchHeaders().then((headers) =>
      fetch("/api/billing", { headers })
        .then(async (r) => {
          const data = (await r.json()) as BillingInfo | { error?: string };
          if (!r.ok) {
            throw new Error("error" in data ? data.error : "課金情報の取得に失敗しました");
          }
          return data;
        })
        .then((data: BillingInfo | { error?: string }) => {
          if ("plan" in data) setBilling(data);
        })
        .catch((fetchError) => {
          setError(fetchError instanceof Error ? fetchError.message : "課金情報の取得に失敗しました");
        })
        .finally(() => setBillingLoading(false)),
    );
  }, [user]);

  async function handleManageSubscription() {
    setPortalLoading(true);
    setError(null);
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch("/api/billing-portal", { method: "POST", headers });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Stripe管理ページを開けませんでした");
      }
    } catch {
      setError("Stripe管理ページを開けませんでした");
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    );
  }

  const plan = billing?.plan ?? "free";
  const sub = billing?.subscription;
  const isPaid = plan !== "free";
  const periodEnd = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
  const isCanceled = sub?.status === "canceled";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-medium text-teal-700">Billing</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">プラン・課金管理</h1>
      </div>

      {/* 現在のプラン */}
      <section className="mb-6 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">現在のプラン</p>
            <div className="mt-2 flex items-center gap-2">
              <Crown size={22} className="text-teal-600" />
              <p className="text-2xl font-bold text-gray-900">{PLAN_LABELS[plan]}</p>
            </div>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {plan.toUpperCase()}
          </span>
        </div>

        <ul className="mt-4 space-y-1.5">
          {PLAN_FEATURES[plan].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 size={14} className="flex-shrink-0 text-teal-500" />
              {f}
            </li>
          ))}
        </ul>

        {!isPaid && (
          <Link
            href="/pricing"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            プランをアップグレード
            <ArrowRight size={15} />
          </Link>
        )}
      </section>

      {/* サブスクリプション詳細 */}
      {isPaid && (
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-gray-900">サブスクリプション詳細</h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ステータス</span>
              <span className={`font-semibold ${isCanceled ? "text-red-600" : "text-emerald-600"}`}>
                {STATUS_LABELS[sub?.status ?? ""] ?? sub?.status ?? "—"}
              </span>
            </div>

            {periodEnd && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {isCanceled ? "サービス終了日" : "次回更新日"}
                </span>
                <span className="font-semibold text-gray-900">
                  {periodEnd.toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {isCanceled && periodEnd && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              解約済みです。{periodEnd.toLocaleDateString("ja-JP")} までは現在のプランを引き続き利用できます。
            </div>
          )}
        </section>
      )}

      {/* Stripe 管理 */}
      {isPaid && !billingLoading && (
        <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-base font-bold text-gray-900">課金の管理</h2>
          <p className="mb-4 text-sm text-gray-500">
            お支払い方法の変更・領収書の確認・プランの解約はStripeの管理ページで行えます。
          </p>

          {error && (
            <p className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="button"
            onClick={() => void handleManageSubscription()}
            disabled={portalLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-60"
          >
            {portalLoading ? (
              <RefreshCcw size={15} className="animate-spin" />
            ) : (
              <ExternalLink size={15} />
            )}
            {portalLoading ? "開いています..." : "Stripeで課金を管理する"}
          </button>

          <p className="mt-3 text-xs text-gray-400">
            ※ Stripeの安全なページに遷移します。解約後も当該期間末まではプランを利用できます。
          </p>
        </section>
      )}

      {billingLoading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-gray-400">課金情報を取得中...</p>
        </div>
      )}

      {!billingLoading && error && !isPaid && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="text-center">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  );
}
