import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CircleAlert,
  ExternalLink,
  MapPinned,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  EXTERNAL_MINPAKU_PROPERTY_LINKS,
  PROPERTY_LINK_DISCLAIMERS,
  type ExternalMinpakuPropertyLink,
} from "@/lib/data/externalMinpakuPropertyLinks";
import { PropertyAnalysisCta, PropertyAnalysisPanel } from "./PropertyAnalysisGate";

export const metadata: Metadata = {
  title: "民泊向き物件候補・外部リンク集 | YADOKARI",
  description:
    "公式届出済み民泊施設マップと、外部の民泊可・民泊相談可物件リンク集をYADOKARI分析付きで確認できます。",
};

const CATEGORY_LABELS: Record<ExternalMinpakuPropertyLink["category"], string> = {
  rent: "賃貸",
  sale: "売買",
  mixed: "賃貸・売買",
};

export default function PropertiesPage() {
  return (
    <main className="bg-gray-50">
      <section className="border-b border-teal-100 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm ring-1 ring-teal-100">
              <Search size={16} />
              民泊向き物件候補
            </div>
            <h1 className="text-3xl font-bold tracking-normal text-gray-950 sm:text-4xl">
              公式データでエリアを見て、外部掲載元で空き物件候補を探す
            </h1>
            <p className="mt-4 text-base leading-7 text-gray-600">
              YADOKARIでは、公式届出済み民泊施設の分布から実績エリアを確認し、外部の民泊可・民泊相談可物件サイトへ進める導線を用意しています。
              物件そのものの可否は断定せず、用途地域・条例・周辺競合・収益性をあわせて判断します。
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <ActionCard
              href="/map"
              icon={<MapPinned size={19} />}
              title="公式届出済み施設マップ"
              description="住宅宿泊事業の届出済み施設から、実際に民泊運用があるエリアを確認します。"
            />
            <ActionCard
              href="/search"
              icon={<Sparkles size={19} />}
              title="YADOKARIエリア分析"
              description="競合数、制度種別、収益性の目安から投資候補エリアを絞り込みます。"
            />
            <ActionCard
              href="/submit-property"
              icon={<BadgeCheck size={19} />}
              title="物件掲載を申請"
              description="不動産会社・オーナー向け。審査後にYADOKARI掲載候補として扱います。"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-950">外部の民泊可物件リンク集</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              掲載元の情報を確認しながら、気になる物件はYADOKARIで可否・競合・収益をチェックしてください。
            </p>
          </div>
          <Link
            href="/check"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            住所をチェック
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {EXTERNAL_MINPAKU_PROPERTY_LINKS.map((item) => (
            <ExternalPropertyCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <PropertyAnalysisPanel />

      <section className="border-y border-gray-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <ShieldCheck size={14} />
              YADOKARI分析で見るポイント
            </div>
            <h2 className="text-2xl font-bold text-gray-950">「民泊可」の表記だけで判断しない</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              民泊可・相談可と書かれていても、実際には契約、転貸承諾、管理規約、用途地域、消防、条例、近隣説明などの確認が必要です。
              YADOKARIでは物件探しの前後で、この確認作業を短くするための分析に寄せます。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {[
              "公式届出済み施設が周辺にあるか",
              "住宅宿泊・特区民泊・旅館業のどれが現実的か",
              "年間180日制限でも収支が合うか",
              "賃料・初期費用に対して想定売上が足りるか",
            ].map((check) => (
              <div key={check} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm font-semibold text-gray-800">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs text-teal-700">
                  ✓
                </span>
                {check}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <CircleAlert size={20} className="mt-0.5 flex-shrink-0 text-amber-700" />
            <div>
              <h2 className="text-base font-bold text-amber-950">掲載情報の扱い</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                {PROPERTY_LINK_DISCLAIMERS.map((item) => (
                  <li key={item}>・{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ExternalPropertyCard({ item }: { item: ExternalMinpakuPropertyLink }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
            {CATEGORY_LABELS[item.category]}
          </div>
          <h3 className="text-lg font-bold text-gray-950">{item.name}</h3>
          <p className="mt-1 text-xs font-semibold text-gray-400">{item.sourceType} / {item.coverage}</p>
        </div>
        <Building2 size={22} className="flex-shrink-0 text-gray-300" />
      </div>
      <p className="text-sm leading-6 text-gray-600">{item.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
        <p className="text-xs font-bold text-teal-800">YADOKARIで確認する項目</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {item.yadokariChecks.map((check) => (
            <span key={check} className="text-xs font-medium text-teal-900">
              ・{check}
            </span>
          ))}
        </div>
      </div>
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
      >
        掲載元で見る
        <ExternalLink size={15} />
      </a>
      <PropertyAnalysisCta className="mt-3 w-full" />
    </article>
  );
}

function ActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        {icon}
      </div>
      <h2 className="text-base font-bold text-gray-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
        開く <ArrowRight size={12} />
      </span>
    </Link>
  );
}
