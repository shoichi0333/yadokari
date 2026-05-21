import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Mail, MapPin, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "民泊向け物件検索は準備中 | YADOKARI",
  description:
    "YADOKARIの民泊向け物件検索は、掲載物件の審査体制を整備中です。現在は民泊可否チェック、詳細レポート、競合マップをご利用ください。",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PropertiesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-emerald-50 p-8 sm:p-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm ring-1 ring-teal-100">
          <Building2 size={16} />
          物件検索は準備中
        </div>
        <h1 className="max-w-3xl text-3xl font-bold tracking-normal text-gray-950 sm:text-4xl">
          掲載物件は審査済みデータに切り替えてから公開します
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
          本番公開後に架空物件や古いシードデータが出ないよう、物件マーケット部分はいったん公開を止めています。
          民泊可否チェック、詳細レポート、競合マップはそのまま利用できます。
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <ActionCard
            href="/check"
            icon={<Shield size={18} />}
            title="民泊可否を調べる"
            description="住所から用途地域と制度別の可否を確認します。"
          />
          <ActionCard
            href="/report"
            icon={<Mail size={18} />}
            title="詳細レポートを見る"
            description="収益目安、制度比較、次の打ち手を整理します。"
          />
          <ActionCard
            href="/map"
            icon={<MapPin size={18} />}
            title="競合マップを見る"
            description="公開データから周辺の民泊密度を確認します。"
          />
        </div>

        <div className="mt-8 rounded-xl border border-gray-100 bg-white p-5">
          <h2 className="text-base font-bold text-gray-900">物件掲載を希望する方へ</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            民泊運用に適した物件情報をお持ちの場合は、掲載申請フォームから送信してください。
            審査済み物件だけを公開する方針に切り替えています。
          </p>
          <Link
            href="/submit-property"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            掲載申請へ進む
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
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
      className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
        {icon}
      </div>
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
        開く <ArrowRight size={12} />
      </span>
    </Link>
  );
}
