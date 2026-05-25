"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Crown,
  Download,
  FileText,
  Lock,
  Mail,
  MapPin,
  Save,
  Shield,
  TrendingUp,
} from "lucide-react";
import MinpakuBadge from "@/components/MinpakuBadge";
import { getCurrentPlan, getPlanLimits, normalizePlanId, PLAN_LABELS, setCurrentPlan, type PlanId } from "@/lib/plan";
import { getSavedReports, saveReport, syncSavedReport } from "@/lib/savedReports";
import { useAuth } from "@/lib/AuthContext";
import { getAuthFetchHeaders } from "@/lib/authFetch";
import {
  canRunCheck,
  getCheckUsageSnapshot,
  recordCheckUsage,
  syncServerCheckUsage,
  type CheckUsageSnapshot,
} from "@/lib/usageLimits";

type CheckResult = {
  address: string;
  lat: number;
  lng: number;
  ward: string | null;
  prefecture?: string;
  typicalZoning?: string;
  tokkuArea?: boolean;
  notes?: string;
  suumoUrl?: string;
  minpakuInfo?: { juutaku: boolean; tokku: boolean; ryokan: boolean };
  badgeType?: "JUUTAKU" | "TOKKU" | "RYOKAN" | "NG";
  competitionCount?: number;
  message?: string;
  error?: string;
  usage?: CheckUsageSnapshot;
};

function getPotentialScore(result: CheckResult) {
  const info = result.minpakuInfo;
  if (!info) return 0;

  const eligible = info.juutaku || info.tokku || info.ryokan;
  if (!eligible) return 20;

  const competitionCount = result.competitionCount ?? 0;
  const operationScore = info.ryokan ? 35 : info.tokku ? 32 : 22;
  const competitionScore = competitionCount <= 50 ? 28 : competitionCount <= 200 ? 20 : 12;
  const locationScore = result.tokkuArea ? 18 : result.ward ? 14 : 8;
  const dataScore = result.typicalZoning ? 14 : 8;

  return Math.min(95, operationScore + competitionScore + locationScore + dataScore);
}

function getRevenueRange(result: CheckResult) {
  const info = result.minpakuInfo;
  if (!info || (!info.juutaku && !info.tokku && !info.ryokan)) {
    return null;
  }

  const maxDays = info.tokku || info.ryokan ? 365 : 180;
  const competitionCount = result.competitionCount ?? 0;
  const config =
    competitionCount > 200
      ? { nightly: 8500, occupancy: 0.4 }
      : competitionCount > 50
        ? { nightly: 10000, occupancy: 0.5 }
        : { nightly: 12000, occupancy: 0.62 };

  const monthlyRevenue = (maxDays / 12) * config.occupancy * config.nightly;

  return {
    min: Math.round((monthlyRevenue * 0.75) / 10000),
    max: Math.round((monthlyRevenue * 1.25) / 10000),
    nightly: config.nightly,
    occupancy: Math.round(config.occupancy * 100),
    maxDays,
  };
}

function getRecommendedType(result: CheckResult) {
  const info = result.minpakuInfo;
  if (!info) return "要確認";
  if (info.tokku) return "特区民泊";
  if (info.ryokan) return "旅館業許可";
  if (info.juutaku) return "住宅宿泊事業";
  return "民泊不可";
}

export default function ReportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAddress = searchParams.get("address") ?? "";
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const initialLoadDone = useRef(false);
  const [address, setAddress] = useState(initialAddress);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanId>("free");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [usage, setUsage] = useState<CheckUsageSnapshot>(() => getCheckUsageSnapshot("free"));
  const { user, plan: authPlan, loading: authLoading } = useAuth();

  async function loadReport(targetAddress: string) {
    const value = targetAddress.trim();
    if (!value || loading) return;
    const checkoutPlan = normalizePlanId(searchParams.get("plan"));
    const effectivePlan = checkoutSuccess && checkoutPlan !== "free" ? checkoutPlan : authPlan;

    if (!canRunCheck(effectivePlan)) {
      const snapshot = getCheckUsageSnapshot(effectivePlan);
      setUsage(snapshot);
      setError(`無料チェックは本日${snapshot.limit ?? 0}回までです。詳細レポートの作成を続けるには有料プランをご利用ください。`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/check-minpaku?address=${encodeURIComponent(value)}`, {
        headers: await getAuthFetchHeaders(),
      });
      const data = (await response.json()) as CheckResult;
      setUsage(syncServerCheckUsage(effectivePlan, data.usage));

      if (!response.ok || data.error) {
        setError(data.error ?? "レポートを作成できませんでした。");
        return;
      }

      setResult(data);
      if (!data.usage) {
        setUsage(recordCheckUsage(effectivePlan));
      }
      setSaved(false);
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const currentPlan = getCurrentPlan();
    if (checkoutSuccess && currentPlan === "free") {
      const checkoutPlan = normalizePlanId(searchParams.get("plan"));
      const nextPlan = checkoutPlan === "free" ? "standard" : checkoutPlan;
      setCurrentPlan(nextPlan);
      Promise.resolve().then(() => setPlan(nextPlan));
    } else {
      Promise.resolve().then(() => setPlan(currentPlan));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!checkoutSuccess) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlan(authPlan);
      setUsage(getCheckUsageSnapshot(authPlan));
    }
  }, [authPlan, checkoutSuccess]);

  useEffect(() => {
    if (!initialAddress || initialLoadDone.current) return;
    if (authLoading && !checkoutSuccess) return;

    initialLoadDone.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReport(initialAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, checkoutSuccess, initialAddress, plan]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadReport(address);
  }

  const score = useMemo(() => (result ? getPotentialScore(result) : 0), [result]);
  const revenue = useMemo(() => (result ? getRevenueRange(result) : null), [result]);
  const recommendedType = result ? getRecommendedType(result) : "";
  const pricingHref = result
    ? `/pricing?source=report&address=${encodeURIComponent(result.address)}`
    : "/pricing?source=report";
  const reportUnlocked = plan === "standard" || plan === "pro";

  function handleSaveReport() {
    if (!result || !reportUnlocked) return;

    if (!user) {
      const next = `/report?address=${encodeURIComponent(result.address)}`;
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }

    const saveLimit = getPlanLimits(plan).savedReports;
    const existingReports = getSavedReports();
    const isUpdatingExisting = existingReports.some((item) => item.address === result.address);

    if (saveLimit !== null && !isUpdatingExisting && existingReports.length >= saveLimit) {
      setSaveError(`現在のプランでは保存レポートは${saveLimit}件までです。`);
      return;
    }

    const report = {
      address: result.address,
      prefecture: result.prefecture,
      ward: result.ward,
      recommendedType,
      score,
      monthlyRevenueMin: revenue?.min ?? null,
      monthlyRevenueMax: revenue?.max ?? null,
      createdAt: new Date().toISOString(),
    };
    saveReport(report);
    if (user?.email) {
      void syncSavedReport(user.email, report);
    }
    setSaved(true);
    setSaveError(null);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                <FileText size={14} />
                Detailed Report
              </div>
              <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                民泊詳細レポート
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
                住所ごとの可否、競合、収益目安、次に確認すべき項目をまとめます。無料版では概要、有料版では詳細収支と実務チェックを確認できます。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full gap-2 lg:max-w-md">
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="例: 東京都港区六本木"
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <button
                type="submit"
                disabled={loading || authLoading || usage.isLimitReached}
                className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
              >
                {loading ? "作成中" : "作成"}
              </button>
            </form>
            <p className="text-xs font-semibold text-gray-400 lg:text-right">
              {usage.limit === null ? "有料プラン: 作成回数無制限" : `本日の無料チェック: ${usage.used}/${usage.limit}回`}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {!result && !error && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <Shield size={40} className="mx-auto text-teal-600" />
            <p className="mt-4 text-lg font-bold text-gray-900">住所を入力してレポートを作成</p>
            <p className="mt-2 text-sm text-gray-500">
              可否チェッカーの結果画面からも、このレポートに移動できます。
            </p>
          </div>
        )}

        {result && (
            <div className="space-y-6">
            {checkoutSuccess && reportUnlocked && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                詳細レポートを解放しました。この画面で収益・初期費用・実務タスクまで確認できます。
              </div>
            )}

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <MapPin size={18} className="text-teal-600" />
                    <h2 className="text-xl font-black">{result.address}</h2>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {[result.prefecture, result.ward].filter(Boolean).join(" ")}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  {result.badgeType && <MinpakuBadge type={result.badgeType} />}
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                    現在: {PLAN_LABELS[plan]}プラン
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <MetricCard label="ポテンシャル" value={`${score}/100`} sub={score >= 80 ? "高ポテンシャル" : score >= 65 ? "検討価値あり" : "条件確認が必要"} />
                <MetricCard label="推奨制度" value={recommendedType} sub="初期判断" />
                <MetricCard label="競合届出住宅" value={`${(result.competitionCount ?? 0).toLocaleString("ja-JP")}件`} sub="同一エリア概算" />
                <MetricCard label="収益目安" value={revenue ? `${revenue.min}〜${revenue.max}万円` : "要確認"} sub="月間売上目安" />
              </div>

              {!reportUnlocked && <ConversionStrip address={result.address} pricingHref={pricingHref} />}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
                <h3 className="flex items-center gap-2 text-lg font-black text-gray-950">
                  <CheckCircle2 size={18} className="text-teal-600" />
                  無料レポート概要
                </h3>
                <div className="mt-5 space-y-4">
                  <ReportRow label="用途地域" value={result.typicalZoning ?? "要確認"} />
                  <ReportRow label="制度区分" value={recommendedType} />
                  <ReportRow label="特区判定" value={result.tokkuArea ? "特区エリアに該当" : "特区エリア外"} />
                  <ReportRow label="メモ" value={result.notes ?? result.message ?? "住所単位の詳細確認を推奨します。"} />
                </div>

                {revenue && (
                  <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50 p-4">
                    <p className="text-sm font-bold text-teal-900">収益前提</p>
                    <p className="mt-2 text-sm leading-6 text-teal-700">
                      宿泊単価{revenue.nightly.toLocaleString("ja-JP")}円、稼働率{revenue.occupancy}%、年間営業日数{revenue.maxDays}日で試算しています。
                    </p>
                  </div>
                )}
              </section>

              <aside className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Crown size={22} />
                </div>
                <h3 className="text-lg font-black text-gray-950">
                  {reportUnlocked ? "詳細版を利用中" : "詳細版で見られること"}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-gray-600">
                  {(reportUnlocked
                    ? [
                        "実質利益・初期費用の詳細試算を表示中",
                        "実務チェックリストを表示中",
                        "競合密度に応じた価格戦略を表示中",
                        "印刷・PDF保存に対応",
                      ]
                    : [
                        "清掃費・手数料込みの利益試算",
                        "管理規約・消防設備チェックリスト",
                        "競合密度に応じた価格戦略",
                        "提案用レポートの保存・共有",
                      ]).map((item) => (
                    <li key={item} className="flex gap-2">
                      {reportUnlocked ? (
                        <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0 text-teal-600" />
                      ) : (
                        <Lock size={15} className="mt-0.5 flex-shrink-0 text-teal-600" />
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {reportUnlocked ? (
                  <div className="mt-6 grid gap-2">
                    <button
                      type="button"
                      onClick={handleSaveReport}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700"
                    >
                      {!user ? "ログインして保存" : saved ? "保存しました" : "ダッシュボードに保存"}
                      <Save size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
                    >
                      印刷・PDF保存
                      <Download size={15} />
                    </button>
                    {saveError && <p className="text-xs font-semibold text-red-600">{saveError}</p>}
                  </div>
                ) : (
                  <Link
                    href={pricingHref}
                    className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
                  >
                    詳細版を使う
                    <ArrowRight size={15} />
                  </Link>
                )}
                <Link
                  href={`/contact?address=${encodeURIComponent(result.address)}`}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  相談して進める
                  <Mail size={15} />
                </Link>
              </aside>
            </div>

            {reportUnlocked && revenue ? (
              <DetailedReportSections
                result={result}
                revenue={revenue}
                score={score}
                recommendedType={recommendedType}
              />
            ) : (
              <LockedReportPreview pricingHref={pricingHref} />
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <ActionCard icon={<Building2 size={18} />} title="候補物件を探す" href={result.prefecture ? `/properties?prefecture=${encodeURIComponent(result.prefecture)}` : "/properties"} />
              <ActionCard icon={<TrendingUp size={18} />} title="詳細レポートを解放" href={pricingHref} />
              <ActionCard icon={<Mail size={18} />} title="相談する" href={`/contact?address=${encodeURIComponent(result.address)}`} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function ConversionStrip({ address, pricingHref }: { address: string; pricingHref: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black text-gray-950">この住所で事業判断まで進める</p>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {address} の無料判定は完了しました。次は利益・初期費用・許認可タスクを具体化します。
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={pricingHref}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
          >
            詳細レポートを解放
            <ArrowRight size={15} />
          </Link>
          <Link
            href={`/contact?address=${encodeURIComponent(address)}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-bold text-teal-700 transition-colors hover:bg-teal-50"
          >
            専門家に相談
            <Mail size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function LockedReportPreview({ pricingHref }: { pricingHref: string }) {
  const rows = [
    { label: "実質利益", free: "月間売上目安のみ", paid: "清掃費・OTA手数料・家賃控除後まで試算" },
    { label: "初期費用", free: "要確認", paid: "家具家電・消防設備・届出準備の概算" },
    { label: "競合戦略", free: "届出件数のみ", paid: "競合密度別の単価・稼働率シナリオ" },
    { label: "実務タスク", free: "概要のみ", paid: "管理規約、消防、近隣説明、届出のチェックリスト" },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white">
              <Lock size={13} />
              有料版で解放
            </div>
            <h3 className="text-xl font-black text-gray-950">投資判断レポート</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              無料版は「できるか」の確認。有料版は「やるべきか」「いくら残るか」「何から着手するか」まで落とし込みます。
            </p>
          </div>
          <Link
            href={pricingHref}
            className="hidden flex-shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700 sm:flex"
          >
            解放する
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
      <div className="grid gap-0 md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="border-b border-gray-100 p-5 odd:md:border-r md:[&:nth-last-child(-n+2)]:border-b-0">
            <p className="text-sm font-black text-gray-950">{row.label}</p>
            <div className="mt-3 grid gap-2 text-xs leading-5">
              <div className="rounded-xl bg-gray-50 p-3 text-gray-500">
                無料: {row.free}
              </div>
              <div className="rounded-xl border border-teal-100 bg-teal-50 p-3 font-semibold text-teal-800">
                詳細: {row.paid}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-5 sm:hidden">
        <Link
          href={pricingHref}
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-700"
        >
          詳細版を解放する
          <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

function DetailedReportSections({
  result,
  revenue,
  score,
  recommendedType,
}: {
  result: CheckResult;
  revenue: NonNullable<ReturnType<typeof getRevenueRange>>;
  score: number;
  recommendedType: string;
}) {
  const monthlySales = Math.round(((revenue.min + revenue.max) / 2) * 10000);
  const rentEstimate = recommendedType === "住宅宿泊事業" ? 140000 : 180000;
  const cleaningCost = Math.round(monthlySales * 0.12);
  const platformFee = Math.round(monthlySales * 0.15);
  const utilityCost = recommendedType === "住宅宿泊事業" ? 28000 : 42000;
  const netProfit = monthlySales - rentEstimate - cleaningCost - platformFee - utilityCost;
  const initialCost = recommendedType === "旅館業許可" ? 2600000 : recommendedType === "特区民泊" ? 1800000 : 1200000;
  const paybackMonths = netProfit > 0 ? Math.ceil(initialCost / netProfit) : null;
  const competitionCount = result.competitionCount ?? 0;
  const densityLabel = competitionCount > 200 ? "高密度" : competitionCount > 50 ? "中密度" : "低密度";
  const priceStrategy =
    competitionCount > 200
      ? "競合が多いため、駅距離・内装写真・レビュー獲得を優先し、平日は価格を抑えて稼働率を取りにいく設計が向いています。"
      : competitionCount > 50
        ? "競合は一定数あります。週末単価を高めに置き、平日は清掃費込みの割安感で稼働を安定させる方針が有効です。"
        : "競合が少ないため、相場を見ながら強気の初期単価を試せます。早期レビュー獲得後に段階的な値上げを検討できます。";

  const checklist = [
    { title: "管理規約・賃貸借契約", detail: "転貸、短期貸し、宿泊用途の禁止条項がないか確認" },
    { title: "自治体窓口確認", detail: `${result.ward ?? "対象自治体"}で届出・許可の事前相談を行う` },
    { title: "消防設備", detail: "自火報、誘導灯、消火器など必要設備と見積りを確認" },
    { title: "近隣説明・運営体制", detail: "苦情対応窓口、騒音対策、ゴミ出しルールを整理" },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
        <h3 className="flex items-center gap-2 text-lg font-black text-gray-950">
          <TrendingUp size={18} className="text-teal-600" />
          詳細収支シミュレーション
        </h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <DetailMetric label="月間売上" value={`${Math.round(monthlySales / 10000)}万円`} />
          <DetailMetric label="想定家賃" value={`${Math.round(rentEstimate / 10000)}万円`} />
          <DetailMetric label="清掃・備品" value={`${Math.round(cleaningCost / 10000)}万円`} />
          <DetailMetric label="OTA手数料" value={`${Math.round(platformFee / 10000)}万円`} />
          <DetailMetric label="水道光熱・通信" value={`${Math.round(utilityCost / 10000)}万円`} />
          <DetailMetric label="実質利益目安" value={`${Math.round(netProfit / 10000)}万円`} strong={netProfit > 0} />
        </div>
        <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50 p-4">
          <p className="text-sm font-bold text-teal-900">
            初期費用目安: {Math.round(initialCost / 10000).toLocaleString("ja-JP")}万円
          </p>
          <p className="mt-2 text-sm leading-6 text-teal-700">
            {paybackMonths
              ? `現在の試算では、投資回収は約${paybackMonths}か月です。`
              : "現在の試算では、家賃や運営費の見直しが必要です。"}
            実際の収支は面積、駅距離、内装、運営代行費で変動します。
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black text-gray-950">価格戦略</h3>
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-500">競合密度</p>
          <p className="mt-1 text-2xl font-black text-gray-950">{densityLabel}</p>
          <p className="mt-1 text-xs text-gray-500">{competitionCount.toLocaleString("ja-JP")}件</p>
        </div>
        <p className="mt-4 text-sm leading-7 text-gray-600">{priceStrategy}</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-gray-950">実務チェックリスト</h3>
            <p className="mt-1 text-sm text-gray-500">
              ポテンシャル{score}/100、推奨制度は{recommendedType}です。次の確認を終えると実行判断に進めます。
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
          >
            <Download size={15} />
            提案用に保存
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {checklist.map((item, index) => (
            <div key={item.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-black text-white">
                {index + 1}
              </span>
              <p className="mt-3 text-sm font-black text-gray-950">{item.title}</p>
              <p className="mt-2 text-xs leading-5 text-gray-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailMetric({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${strong ? "border-teal-100 bg-teal-50" : "border-gray-100 bg-gray-50"}`}>
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-black tracking-tight ${strong ? "text-teal-700" : "text-gray-950"}`}>
        {value}
      </p>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-gray-950">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{sub}</p>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-gray-900">{value}</p>
    </div>
  );
}

function ActionCard({ icon, title, href }: { icon: React.ReactNode; title: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          {icon}
        </span>
        {title}
      </span>
      <ArrowRight size={15} className="text-gray-300" />
    </Link>
  );
}
