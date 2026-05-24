"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Building2,
  Link2,
  TrendingUp,
  ArrowRight,
  Mail,
  Share2,
  Ban,
  Crown,
} from "lucide-react";
import MinpakuBadge from "@/components/MinpakuBadge";
import { saveCheckHistory, syncCheckHistory } from "@/lib/checkHistory";
import { useAuth } from "@/lib/AuthContext";
import { getSuumoRentSearchUrl } from "@/lib/propertyPortalLinks";

const CheckerMap = dynamic(() => import("./CheckerMap"), { ssr: false });

type PropertyDetails = {
  rent?: string | null;
  layout?: string | null;
  areaSqm?: string | null;
  station?: string | null;
  zoning?: string | null;
  siteName?: string | null;
  sourceUrl?: string | null;
};

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
  propertyDetails?: PropertyDetails;
};

type FetchPropertyResult = PropertyDetails & {
  address?: string | null;
  error?: string;
  partialDetails?: PropertyDetails;
};

type EligibilityKind = "juutaku" | "tokku" | "ryokan";

const samples = [
  "東京都港区六本木",
  "大阪市浪速区難波",
  "京都市東山区祇園",
  "北海道札幌市中央区",
  "福岡市博多区中洲",
  "沖縄県那覇市国際通り",
  "神奈川県横浜市中区みなとみらい",
  "広島市中区平和記念公園近く",
  "宮城県仙台市青葉区国分町",
  "石川県金沢市東山ひがし",
];

export default function CheckerClient() {
  const searchParams = useSearchParams();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [mode, setMode] = useState<"address" | "url">("address");
  const { user } = useAuth();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAddress(q);
      void runCheck(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runCheck(value: string) {
    const input = value.trim();
    if (!input || loading) return;

    const detectedMode = input.toLowerCase().startsWith("http") ? "url" : "address";
    setMode(detectedMode);
    setLoading(true);
    setResult(null);

    try {
      let targetAddress = input;
      let propertyDetails: PropertyDetails | undefined;

      if (detectedMode === "url") {
        const propertyRes = await fetch(`/api/fetch-property?url=${encodeURIComponent(input)}`);
        const propertyData = (await propertyRes.json()) as FetchPropertyResult;

        if (!propertyRes.ok || propertyData.error || !propertyData.address) {
          setResult({
            address: "",
            lat: 0,
            lng: 0,
            ward: null,
            error: propertyData.error ?? "物件URLから住所を取得できませんでした。",
            propertyDetails: propertyData.partialDetails,
          });
          return;
        }

        targetAddress = propertyData.address;
        propertyDetails = {
          rent: propertyData.rent,
          layout: propertyData.layout,
          areaSqm: propertyData.areaSqm,
          station: propertyData.station,
          zoning: propertyData.zoning,
          siteName: propertyData.siteName,
          sourceUrl: propertyData.sourceUrl,
        };
      }

      const checkRes = await fetch(`/api/check-minpaku?address=${encodeURIComponent(targetAddress)}`);
      const checkData = (await checkRes.json()) as CheckResult;

      const merged = {
        ...checkData,
        propertyDetails,
        error: checkRes.ok ? checkData.error : checkData.error ?? "判定に失敗しました。",
      };
      setResult(merged);

      if (checkRes.ok && merged.ward && merged.minpakuInfo) {
        const historyEntry = {
          address: merged.address,
          ward: merged.ward,
          prefecture: merged.prefecture,
          juutaku: merged.minpakuInfo.juutaku,
          tokku: merged.minpakuInfo.tokku,
          ryokan: merged.minpakuInfo.ryokan,
          checkedAt: new Date().toISOString(),
        };
        saveCheckHistory(historyEntry);
        if (user?.email) {
          void syncCheckHistory(user.email, historyEntry);
        }
      }
    } catch {
      setResult({
        address: "",
        lat: 0,
        lng: 0,
        ward: null,
        error: "通信エラーが発生しました。時間をおいて再度お試しください。",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runCheck(address);
  }

  function handleSampleClick(sample: string) {
    setAddress(sample);
    void runCheck(sample);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-teal-700 to-emerald-600 text-white py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">民泊可否チェッカー</h1>
          <p className="mt-3 text-sm text-teal-50 sm:text-base">
            住所またはSUUMO・アットホームの物件URLを入力してください
          </p>

          <form onSubmit={handleSubmit} className="mt-8 rounded-2xl bg-white p-2 shadow-sm sm:flex sm:items-center sm:gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="住所 または SUUMO・アットホームの物件URL"
                className="w-full rounded-xl bg-white py-4 pl-12 pr-5 text-base text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400 sm:mt-0 sm:w-auto"
            >
              {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Search size={18} />}
              判定する
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {samples.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleSampleClick(sample)}
                disabled={loading}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-60"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      {result && (
        <section className="mx-auto max-w-2xl px-4 py-8">
          {result.error ? (
            <MessageCard icon={<AlertCircle size={22} />} text={result.error} />
          ) : result.message && !result.ward ? (
            <MessageCard icon={<AlertCircle size={22} />} text={result.message} />
          ) : result.ward && result.minpakuInfo ? (
            <ResultCard result={result} mode={mode} />
          ) : null}
        </section>
      )}
    </div>
  );
}

function MessageCard({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-gray-700 shadow-sm">
      <div className="mt-0.5 text-gray-500">{icon}</div>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function ResultCard({ result, mode }: { result: CheckResult; mode: "address" | "url" }) {
  const [shareCopied, setShareCopied] = useState(false);
  const details = result.propertyDetails;
  const propertiesHref = result.prefecture
    ? `/properties?prefecture=${encodeURIComponent(result.prefecture)}`
    : "/properties";
  const infoItems = [
    details?.rent ? `賃料 ${details.rent}` : null,
    details?.layout ? `間取り ${details.layout}` : null,
    details?.areaSqm ? `面積 ${details.areaSqm}` : null,
    details?.station ? `最寄り ${details.station}` : null,
  ].filter(Boolean);

  function handleShareClick() {
    void navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-2 text-gray-900">
            <MapPin className="mt-0.5 flex-shrink-0 text-teal-600" size={20} />
            <div>
              <h2 className="break-words text-lg font-bold">{result.address}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {[result.prefecture, result.ward].filter(Boolean).join(" ")}
              </p>
            </div>
          </div>
        </div>
        {result.badgeType && <MinpakuBadge type={result.badgeType} size="sm" />}
      </div>

      {details && infoItems.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
          {infoItems.map((item) => (
            <span key={item} className="rounded-full bg-white px-3 py-1 shadow-sm">
              {item}
            </span>
          ))}
          {details.siteName && (
            <span className="rounded-full bg-white px-3 py-1 shadow-sm">
              {details.siteName}から取得
            </span>
          )}
        </div>
      )}

      {result.lat !== 0 && result.lng !== 0 && (
        <div className="mt-6">
          <CheckerMap lat={result.lat} lng={result.lng} address={result.address} />
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <EligibilityCard
          enabled={result.minpakuInfo?.juutaku ?? false}
          kind="juutaku"
          title="住宅宿泊事業"
          subtitle="年間最大180日"
        />
        <EligibilityCard
          enabled={result.minpakuInfo?.tokku ?? false}
          kind="tokku"
          title="特区民泊"
          subtitle="日数制限なし"
          badge={result.tokkuArea ? "特区認定エリア" : undefined}
        />
        <EligibilityCard
          enabled={result.minpakuInfo?.ryokan ?? false}
          kind="ryokan"
          title="旅館業許可"
          subtitle="年間365日営業可"
        />
      </div>

      <PotentialScore result={result} />

      {result.minpakuInfo && !result.minpakuInfo.juutaku && !result.minpakuInfo.tokku && !result.minpakuInfo.ryokan && (
        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Ban size={16} className="text-red-500" />
            <span className="text-sm font-bold text-red-800">このエリアは民泊不可です</span>
          </div>
          <p className="mb-3 text-xs leading-relaxed text-red-700">
            工業地域など民泊営業ができない用途地域のため、住宅宿泊・特区民泊・旅館業のいずれも不可です。別のエリアで検索してみましょう。
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/check"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
            >
              別のエリアを確認する
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/area"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
            >
              <MapPin size={13} />
              エリアガイドで探す
            </Link>
          </div>
        </div>
      )}

      <RevenueEstimate
        competitionCount={result.competitionCount ?? 0}
        minpakuInfo={result.minpakuInfo ?? { juutaku: false, tokku: false, ryokan: false }}
      />

      <NextActionPlan result={result} mode={mode} />

      {result.notes && <p className="mt-5 text-sm italic leading-relaxed text-gray-500">{result.notes}</p>}

      {result.typicalZoning && (
        <p className="mt-4 text-xs text-gray-500">判定根拠: {result.typicalZoning}（区レベル概算）</p>
      )}

      {typeof result.competitionCount === "number" && result.competitionCount > 0 && (
        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-teal-700">
          <Link2 size={16} />
          競合届出住宅 {result.competitionCount.toLocaleString("ja-JP")}件 このエリアに登録済み
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-gray-500">
        ※ 区レベルの概算です。正確な判定は市区町村窓口または不動産会社へご確認ください。
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a
          href={result.suumoUrl ?? getSuumoRentSearchUrl(result.prefecture ?? result.address, result.ward ?? undefined)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          SUUMOで探す
          <ExternalLink size={16} />
        </a>
        <Link
          href={propertiesHref}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
        >
          <Building2 size={16} />
          物件を探す
        </Link>
        <Link
          href={`/map${mode === "address" ? `?q=${encodeURIComponent(result.address)}` : ""}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
        >
          <MapPin size={16} />
          競合マップで確認
        </Link>
        {result.prefecture && result.ward && (
          <Link
            href={`/area/${result.prefecture}/${result.ward}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
          >
            <MapPin size={16} />
            エリアガイドを見る
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={handleShareClick}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
      >
        <Share2 size={14} />
        {shareCopied ? "コピーしました！" : "この結果をシェア"}
      </button>

      <EmailCapture address={result.address} />
    </div>
  );
}

function PotentialScore({ result }: { result: CheckResult }) {
  const info = result.minpakuInfo;
  if (!info) return null;

  const eligible = info.juutaku || info.tokku || info.ryokan;
  if (!eligible) return null;

  const competitionCount = result.competitionCount ?? 0;
  const operationScore = info.ryokan ? 35 : info.tokku ? 32 : 22;
  const competitionScore = competitionCount <= 50 ? 28 : competitionCount <= 200 ? 20 : 12;
  const locationScore = result.tokkuArea ? 18 : result.ward ? 14 : 8;
  const dataScore = result.propertyDetails ? 14 : 8;
  const score = Math.min(95, operationScore + competitionScore + locationScore + dataScore);
  const label = score >= 80 ? "高ポテンシャル" : score >= 65 ? "検討価値あり" : "条件確認が必要";
  const tone = score >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-amber-700 bg-amber-50 border-amber-100";

  return (
    <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-600" />
            <p className="text-sm font-bold text-gray-900">民泊ポテンシャル</p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            制度区分、競合数、エリア情報の揃い方から見た初期判断です。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-3xl font-black tracking-tight text-gray-950">{score}</p>
            <p className="text-[11px] font-semibold text-gray-400">/ 100</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${tone}`}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function EligibilityCard({
  enabled,
  kind,
  title,
  subtitle,
  badge,
}: {
  enabled: boolean;
  kind: EligibilityKind;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  const enabledClasses: Record<EligibilityKind, string> = {
    juutaku: "border-green-100 bg-green-50",
    tokku: "border-emerald-100 bg-emerald-50",
    ryokan: "border-purple-100 bg-purple-50",
  };
  const iconClasses: Record<EligibilityKind, string> = {
    juutaku: "text-green-600",
    tokku: "text-emerald-600",
    ryokan: "text-purple-600",
  };

  return (
    <div className={`rounded-2xl border p-4 ${enabled ? enabledClasses[kind] : "border-gray-100 bg-gray-50"}`}>
      {enabled ? (
        <CheckCircle2 className={iconClasses[kind]} size={24} />
      ) : (
        <XCircle className="text-gray-400" size={24} />
      )}
      <h3 className="mt-3 text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      {badge && (
        <span className="mt-3 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
          {badge}
        </span>
      )}
    </div>
  );
}

function RevenueEstimate({
  competitionCount,
  minpakuInfo,
}: {
  competitionCount: number;
  minpakuInfo: { juutaku: boolean; tokku: boolean; ryokan: boolean };
}) {
  const eligible = minpakuInfo.juutaku || minpakuInfo.tokku || minpakuInfo.ryokan;
  if (!eligible) return null;

  const maxDays = minpakuInfo.tokku || minpakuInfo.ryokan ? 365 : 180;
  const density = competitionCount > 200 ? "high" : competitionCount > 50 ? "medium" : "low";
  const config = {
    low: { nightly: 12000, occupancy: 0.62, label: "競合少なく好立地" },
    medium: { nightly: 10000, occupancy: 0.50, label: "競合は中程度" },
    high: { nightly: 8500, occupancy: 0.40, label: "競合が多いエリア" },
  }[density];

  const monthlyRevenue = (maxDays / 12) * config.occupancy * config.nightly;
  const minRevenue = Math.round((monthlyRevenue * 0.75) / 10000);
  const maxRevenue = Math.round((monthlyRevenue * 1.25) / 10000);

  return (
    <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp size={16} className="text-teal-600" />
        <span className="text-sm font-bold text-teal-900">収益クイック試算</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-teal-700">{minRevenue}〜{maxRevenue}万円</span>
        <span className="ml-1 text-sm text-teal-600">/月（売上）</span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-teal-700">
        {config.label}。単価{config.nightly.toLocaleString("ja-JP")}円・稼働率{Math.round(config.occupancy * 100)}%・年間{maxDays}日で試算。
      </p>
      <Link
        href="/properties"
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 underline underline-offset-2 hover:text-teal-900"
      >
        物件ページで詳細シミュレーション
        <ArrowRight size={11} />
      </Link>
    </div>
  );
}

function NextActionPlan({ result, mode }: { result: CheckResult; mode: "address" | "url" }) {
  const info = result.minpakuInfo;
  if (!info) return null;

  const eligible = info.juutaku || info.tokku || info.ryokan;
  const primaryAction = eligible
    ? {
        label: "候補物件を探す",
        href: result.prefecture ? `/properties?prefecture=${encodeURIComponent(result.prefecture)}` : "/properties",
      }
    : { label: "別エリアを探す", href: "/area" };

  const steps = eligible
    ? [
        "管理規約・オーナー承諾の可否を確認",
        "消防設備・近隣説明など初期費用を見積もる",
        "詳細シミュレーターで清掃費・手数料込みの利益を確認",
      ]
    : [
        "用途地域が異なる近隣エリアを探す",
        "旅館業が可能な商業系エリアを比較する",
        "候補住所を複数チェックして履歴に残す",
      ];

  return (
    <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-900">次にやること</p>
          <p className="mt-1 text-xs text-gray-500">
            判定結果を投資判断に変えるための実務ステップです。
          </p>
        </div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700">
          {mode === "url" ? "物件URL判定" : "住所判定"}
        </span>
      </div>

      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link
          href={primaryAction.href}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
        >
          {primaryAction.label}
          <ArrowRight size={15} />
        </Link>
        <Link
          href={`/report?address=${encodeURIComponent(result.address)}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100"
        >
          <Crown size={15} />
          詳細レポートを作成
        </Link>
      </div>
    </div>
  );
}

function EmailCapture({ address }: { address: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), address }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
        <CheckCircle2 size={16} />
        ありがとうございます。エリアレポートをお送りします。
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <Mail size={14} className="text-teal-600" />
        <p className="text-sm font-semibold text-gray-900">このエリアの詳細レポートを受け取る（無料）</p>
      </div>
      <p className="mb-3 text-xs text-gray-500">競合データ・収益予測・法規制まとめをメールでお届けします。</p>
      <form onSubmit={(e) => { void handleSubmit(e); }} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="メールアドレスを入力"
          required
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-70"
        >
          {loading ? "..." : "受け取る"}
        </button>
      </form>
    </div>
  );
}
