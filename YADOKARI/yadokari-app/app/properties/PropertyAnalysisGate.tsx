"use client";

import Link from "next/link";
import { ArrowRight, Crown, Lock, Search, ShieldCheck, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

function getPricingHref(source = "properties") {
  return `/pricing?source=${source}`;
}

export function PropertyAnalysisCta({ className = "" }: { className?: string }) {
  const { plan, loading } = useAuth();
  const unlocked = plan === "standard" || plan === "pro";

  if (loading) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-400 ${className}`}
      >
        確認中...
      </button>
    );
  }

  if (unlocked) {
    return (
      <Link
        href="/report"
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100 ${className}`}
      >
        YADOKARIで分析
        <Search size={15} />
      </Link>
    );
  }

  return (
    <Link
      href={getPricingHref()}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 ${className}`}
    >
      分析は有料
      <Lock size={15} />
    </Link>
  );
}

export function PropertyAnalysisPanel() {
  const { plan } = useAuth();
  const unlocked = plan === "standard" || plan === "pro";
  const features = [
    {
      icon: ShieldCheck,
      title: "住所別の可否詳細",
      description: "用途地域、制度区分、注意点をレポート化",
    },
    {
      icon: TrendingUp,
      title: "収益詳細シミュレーション",
      description: "家賃、清掃費、手数料込みで利益を確認",
    },
    {
      icon: Search,
      title: "周辺競合チェック",
      description: "届出済み施設数から価格戦略を整理",
    },
  ];

  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">
            <Crown size={14} />
            YADOKARI分析
          </div>
          <h2 className="text-2xl font-bold text-gray-950">
            外部リンクは無料、物件判断は有料で深掘り
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            外部掲載元の閲覧は無料のまま開放します。候補物件の住所を見つけたら、YADOKARIで可否・競合・収益・実務タスクまでまとめて確認します。
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <PropertyAnalysisCta />
            {!unlocked && (
              <Link
                href={getPricingHref()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                詳細分析を解放
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className={`rounded-2xl border p-5 ${
                unlocked ? "border-teal-100 bg-teal-50" : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                unlocked ? "bg-white text-teal-700" : "bg-white text-gray-400"
              }`}>
                {unlocked ? <Icon size={19} /> : <Lock size={18} />}
              </div>
              <h3 className="text-sm font-bold text-gray-950">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>
              <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                unlocked ? "bg-white text-teal-700" : "bg-white text-gray-500"
              }`}>
                {unlocked ? "利用可能" : "有料機能"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
