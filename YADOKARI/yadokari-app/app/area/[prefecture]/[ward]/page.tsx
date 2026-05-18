import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Building2, CheckCircle2, MapPin, Shield, TrendingUp, XCircle, ExternalLink } from "lucide-react";
import MinpakuBadge from "@/components/MinpakuBadge";
import { WARD_ZONING_MAP } from "@/lib/data/wardZoning";
import { getMinpakuInfo, getMinpakuBadgeType } from "@/lib/minpaku";

const PREFECTURE_BLOG_MAP: Record<string, { slug: string; title: string }> = {
  "東京都": { slug: "tokyo-minpaku-guide", title: "東京で民泊を始めるには？23区別の可否まとめ" },
  "大阪府": { slug: "osaka-minpaku-guide", title: "大阪で民泊を始めるには？エリア別可否・投資ガイド" },
  "京都府": { slug: "kyoto-minpaku-guide", title: "京都で民泊を始めるには？独自の制限と有望エリアを解説" },
  "愛知県": { slug: "nagoya-minpaku-guide", title: "名古屋で民泊を始めるには？愛知県の区別可否ガイド" },
  "福岡県": { slug: "fukuoka-minpaku-guide", title: "福岡で民泊を始めるには？博多・中洲エリア可否ガイド" },
  "北海道": { slug: "hokkaido-minpaku-guide", title: "北海道・札幌で民泊を始めるには？エリア別可否ガイド" },
  "沖縄県": { slug: "okinawa-minpaku-guide", title: "沖縄で民泊を始めるには？那覇・石垣・宮古島の可否ガイド" },
  "神奈川県": { slug: "yokohama-minpaku-guide", title: "横浜で民泊を始めるには？神奈川県の区別可否ガイド" },
  "広島県": { slug: "hiroshima-minpaku-guide", title: "広島で民泊を始めるには？平和記念公園周辺エリア可否ガイド" },
  "宮城県": { slug: "sendai-minpaku-guide", title: "仙台で民泊を始めるには？東北最大都市の可否・収益ガイド" },
  "石川県": { slug: "kanazawa-minpaku-guide", title: "金沢で民泊を始めるには？兼六園・ひがし茶屋街周辺の可否ガイド" },
  "静岡県": { slug: "shizuoka-atami-guide", title: "熱海で民泊を始めるには？温泉観光地の旅館業・民泊可否ガイド" },
  "長野県": { slug: "nagano-hakuba-guide", title: "白馬・軽井沢で民泊を始めるには？長野県のリゾート民泊可否ガイド" },
  "奈良県": { slug: "nara-minpaku-guide", title: "奈良で民泊を始めるには？古都の民泊可否・収益ガイド" },
  "岡山県": { slug: "okayama-minpaku-guide", title: "岡山県で民泊は可能？桃太郎の街の民泊可否と収益ポテンシャル" },
  "長崎県": { slug: "nagasaki-minpaku-guide", title: "長崎県で民泊は可能？坂の街・軍艦島観光と民泊投資ガイド" },
  "愛媛県": { slug: "matsuyama-minpaku-guide", title: "愛媛県松山市の民泊ガイド｜道後温泉・松山城周辺の投資可否" },
  "岐阜県": { slug: "takayama-minpaku-guide", title: "岐阜県高山市の民泊ガイド｜飛騨古川・古い町並みエリアの投資と可否" },
  "兵庫県": { slug: "kobe-minpaku-guide", title: "神戸で民泊を始めるには？兵庫県のエリア別可否ガイド" },
  "鹿児島県": { slug: "kagoshima-minpaku-guide", title: "鹿児島で民泊は可能？薩摩・屋久島観光の玄関口と民泊投資ガイド" },
};

type PageProps = { params: Promise<{ prefecture: string; ward: string }> };

export function generateStaticParams() {
  return WARD_ZONING_MAP.map((w) => ({
    prefecture: encodeURIComponent(w.prefecture),
    ward: encodeURIComponent(w.ward),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { prefecture: rawPref, ward: rawWard } = await params;
  const prefecture = decodeURIComponent(rawPref);
  const ward = decodeURIComponent(rawWard);
  const wardData = WARD_ZONING_MAP.find((w) => w.prefecture === prefecture && w.ward === ward);
  if (!wardData) return { title: "エリアが見つかりません | YADOKARI" };
  return {
    title: `${prefecture}${ward}の民泊可否・投資ガイド | YADOKARI`,
    description: `${prefecture}${ward}で民泊（住宅宿泊・特区民泊・旅館業）を始めるための可否判定・競合データ・収益試算。${wardData.notes.slice(0, 80)}`,
    openGraph: {
      title: `${prefecture}${ward}の民泊可否ガイド | YADOKARI`,
      description: `${prefecture}${ward}の民泊可否・用途地域・競合データをまとめています。`,
      type: "website",
    },
  };
}

export default async function WardPage({ params }: PageProps) {
  const { prefecture: rawPref, ward: rawWard } = await params;
  const prefecture = decodeURIComponent(rawPref);
  const ward = decodeURIComponent(rawWard);

  const wardData = WARD_ZONING_MAP.find((w) => w.prefecture === prefecture && w.ward === ward);
  if (!wardData) notFound();

  const info = getMinpakuInfo(wardData.typicalZoning, wardData.tokkuArea);
  const corrected = {
    juutaku: info.juutaku,
    tokku: wardData.tokkuArea ? info.tokku : false,
    ryokan: info.ryokan,
  };
  const badge = getMinpakuBadgeType({ ...info, tokku: corrected.tokku });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: "https://yadokari.jp" },
          { "@type": "ListItem", position: 2, name: "エリア一覧", item: "https://yadokari.jp/area" },
          { "@type": "ListItem", position: 3, name: `${prefecture}`, item: `https://yadokari.jp/area/${encodeURIComponent(prefecture)}` },
          { "@type": "ListItem", position: 4, name: `${ward}`, item: `https://yadokari.jp/area/${encodeURIComponent(prefecture)}/${encodeURIComponent(ward)}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `${prefecture}${ward}で民泊はできますか？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${prefecture}${ward}での民泊可否は以下のとおりです。住宅宿泊事業（年180日）: ${corrected.juutaku ? "可能" : "不可"}、特区民泊（日数制限なし）: ${corrected.tokku ? "可能" : "不可"}、旅館業許可（年365日）: ${corrected.ryokan ? "可能" : "不可"}。${wardData.notes}`,
            },
          },
          {
            "@type": "Question",
            name: `${prefecture}${ward}の用途地域は何ですか？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${prefecture}${ward}の代表的な用途地域は「${wardData.typicalZoning}」です。${wardData.tokkuArea ? "国家戦略特区に指定されており、特区民泊（日数制限なし）も可能です。" : ""}なお、同一区内でも用途地域は細かく分かれているため、正確な判定は住所単位でYADOKARIの可否チェッカーをご利用ください。`,
            },
          },
        ],
      },
    ],
  };

  const eligItems = [
    { key: "juutaku", enabled: corrected.juutaku, title: "住宅宿泊事業", sub: "年間最大180日" },
    { key: "tokku", enabled: corrected.tokku, title: "特区民泊", sub: "日数制限なし" },
    { key: "ryokan", enabled: corrected.ryokan, title: "旅館業許可", sub: "年間365日" },
  ] as const;

  const relatedBlog = PREFECTURE_BLOG_MAP[prefecture];

  return (
    <main className="bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-teal-600">トップ</Link>
            <span>/</span>
            <Link href="/area" className="hover:text-teal-600">エリア</Link>
            <span>/</span>
            <Link href={`/area/${encodeURIComponent(prefecture)}`} className="hover:text-teal-600">{prefecture}</Link>
            <span>/</span>
            <span className="text-gray-700">{ward}</span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <MinpakuBadge type={badge} />
            {wardData.tokkuArea && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                国家戦略特区
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {prefecture}{ward}の民泊可否ガイド
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
            {wardData.notes}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/check?q=${encodeURIComponent(`${prefecture}${ward}`)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              <Shield size={16} />
              住所を指定して詳しく調べる
            </Link>
            <a
              href={wardData.suumoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 transition-colors"
            >
              SUUMOで物件を探す
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* 民泊3種類の可否 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">民泊可否（3種類）</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {eligItems.map((item) => (
              <div
                key={item.key}
                className={`rounded-2xl border p-5 ${
                  item.enabled
                    ? "border-green-100 bg-green-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                {item.enabled ? (
                  <CheckCircle2 size={24} className="text-green-600" />
                ) : (
                  <XCircle size={24} className="text-gray-300" />
                )}
                <h3 className="mt-3 font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{item.sub}</p>
                <p className={`mt-3 text-sm font-semibold ${item.enabled ? "text-green-700" : "text-gray-400"}`}>
                  {item.enabled ? "可能" : "不可"}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400">
            ※ {wardData.typicalZoning}に基づく区レベルの概算判定です。正確な判定は市区町村窓口にご確認ください。
          </p>
        </section>

        {/* 周辺エリアリンク */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{prefecture}の他のエリア</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/area/${encodeURIComponent(prefecture)}`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-5 py-3 text-sm font-semibold text-teal-700 shadow-sm hover:border-teal-200 hover:shadow-md transition-all"
            >
              <MapPin size={16} />
              {prefecture}のエリア一覧を見る
              <ArrowRight size={14} />
            </Link>
            {relatedBlog && (
              <Link
                href={`/blog/${relatedBlog.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-5 py-3 text-sm font-semibold text-teal-700 hover:border-teal-300 hover:bg-teal-100 transition-all"
              >
                <BookOpen size={16} />
                {prefecture}の民泊投資ガイドを読む
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </section>

        {/* 物件CTA */}
        <section className="rounded-2xl border border-teal-100 bg-teal-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={16} className="text-teal-600" />
                {prefecture}の民泊物件を探す
              </h2>
              <p className="text-sm text-gray-600 mt-1">住宅宿泊・特区・旅館業対応物件を条件で絞り込み</p>
            </div>
            <Link
              href={`/properties?prefecture=${encodeURIComponent(prefecture)}`}
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              物件一覧を見る <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 p-6 text-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp size={18} />
                収益試算も確認する
              </h2>
              <p className="mt-1 text-sm text-teal-100">
                具体的な住所を入力すると競合密度に応じた月間収益の試算も表示されます。
              </p>
            </div>
            <Link
              href={`/check?q=${encodeURIComponent(`${prefecture}${ward}`)}`}
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
            >
              可否チェッカーへ
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
