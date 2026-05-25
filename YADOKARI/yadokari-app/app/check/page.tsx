import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import CheckerClient from "./CheckerClient";

export const metadata: Metadata = {
  title: "民泊可否チェッカー | YADOKARI",
  description:
    "住所またはSUUMO・アットホームの物件URLを入力するだけで、その場所で民泊（住宅宿泊・特区民泊・旅館業）が可能かを自動判定します。競合届出住宅の件数も確認できます。",
};

const POPULAR_AREAS = [
  { label: "東京都港区", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "東京都大田区", badge: "特区民泊○", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  { label: "大阪市浪速区", badge: "特区民泊○", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  { label: "大阪市北区", badge: "特区民泊○", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  { label: "京都市東山区", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "京都市嵐山", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "愛知県名古屋市中村区", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "神奈川県横浜市中区", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "福岡市博多区", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "北海道札幌市中央区", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "沖縄県那覇市", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "長野県白馬村", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "広島市中区", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "宮城県仙台市青葉区", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "静岡県熱海市", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "奈良県奈良市", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "石川県金沢市", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "沖縄県石垣市", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "岡山県岡山市北区", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "長崎県長崎市", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "愛媛県松山市", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "岐阜県高山市", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "神奈川県鎌倉市", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
  { label: "兵庫県神戸市中央区", badge: "旅館業○", color: "text-purple-700 bg-purple-50 border-purple-100" },
  { label: "鹿児島県鹿児島市", badge: "住宅宿泊○", color: "text-green-700 bg-green-50 border-green-100" },
];

const checkJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "民泊可否チェッカーとは何ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "住所またはSUUMO・アットホームの物件URLを入力するだけで、その場所で民泊（住宅宿泊事業・特区民泊・旅館業）が可能かどうかを自動判定するツールです。用途地域データと国家戦略特区の情報に基づいて判定します。",
      },
    },
    {
      "@type": "Question",
      name: "住宅宿泊事業と特区民泊と旅館業の違いは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "住宅宿泊事業は届出制で年間最大180日営業可能です。特区民泊は国家戦略特区エリアのみで日数制限なく営業できます。旅館業許可は許可取得が必要ですが年間365日営業でき最も収益性が高いです。",
      },
    },
    {
      "@type": "Question",
      name: "民泊が禁止されている用途地域はありますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "工業地域と工業専用地域は民泊（住宅宿泊・特区民泊・旅館業）のすべてが禁止されています。第一種・第二種低層住居専用地域は住宅宿泊のみ可能です。詳細はYADOKARIの可否チェッカーで住所を入力してご確認ください。",
      },
    },
  ],
};

export default function CheckPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(checkJsonLd) }}
      />
      <Suspense>
        <CheckerClient />
      </Suspense>

      {/* SEO静的コンテンツ：人気エリアの判定例 */}
      <section className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="mb-2 text-xl font-bold text-gray-900">人気エリアの民泊可否</h2>
          <p className="mb-6 text-sm text-gray-500">
            クリックするとそのエリアの詳細判定結果を表示します
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {POPULAR_AREAS.map((area) => (
              <Link
                key={area.label}
                href={`/check?q=${encodeURIComponent(area.label)}`}
                className="group flex flex-col gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-teal-200 hover:bg-teal-50 hover:shadow-sm"
              >
                <span className="text-sm font-semibold text-gray-900 group-hover:text-teal-800">
                  {area.label}
                </span>
                <span className={`inline-flex items-center gap-1 self-start rounded-full border px-2 py-0.5 text-[11px] font-semibold ${area.color}`}>
                  <CheckCircle2 size={10} />
                  {area.badge}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900"
            >
              エリア一覧を見る
              <ArrowRight size={14} />
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900"
            >
              届出マップで確認
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* SEO説明コンテンツ */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="mb-6 text-xl font-bold text-gray-900">民泊可否チェッカーの使い方</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "住所またはURLを入力",
                desc: "物件の住所、またはSUUMO・アットホームの物件URLをそのまま貼り付けてください。",
              },
              {
                step: "02",
                title: "3種類の民泊可否を確認",
                desc: "住宅宿泊事業（年180日）・特区民泊（日数無制限）・旅館業許可（日数無制限）の3種類を一度に確認できます。",
              },
              {
                step: "03",
                title: "収益予測とSUUMO検索へ",
                desc: "可否判定後に月間収益の試算を表示。そのままSUUMOで物件を探せます。",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
