import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { ArrowRight, BookOpen, Building2, CheckCircle2, MapPin, Shield, TrendingUp, ExternalLink } from "lucide-react";
import MinpakuBadge from "@/components/MinpakuBadge";
import { WARD_ZONING_MAP } from "@/lib/data/wardZoning";
import { getMinpakuInfo, getMinpakuBadgeType } from "@/lib/minpaku";
import { getSiteUrl } from "@/lib/config";

const siteUrl = getSiteUrl();

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

type PageProps = { params: Promise<{ prefecture: string }> };

const COVERED_PREFECTURES = [...new Set(WARD_ZONING_MAP.map((w) => w.prefecture))].sort();

export function generateStaticParams() {
  return COVERED_PREFECTURES.map((p) => ({ prefecture: encodeURIComponent(p) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { prefecture: raw } = await params;
  const prefecture = decodeURIComponent(raw);
  if (!COVERED_PREFECTURES.includes(prefecture)) return { title: "エリアが見つかりません | YADOKARI" };
  return {
    title: `${prefecture}の民泊可否・投資ガイド | YADOKARI`,
    description: `${prefecture}で民泊（住宅宿泊・特区民泊・旅館業）を始めるための用途地域・法規制・収益情報をエリア別に整理しました。可否チェッカーで住所を入力するとすぐ判定できます。`,
    openGraph: {
      title: `${prefecture}の民泊可否・投資ガイド | YADOKARI`,
      description: `${prefecture}で民泊投資を検討している方向けに、エリア別の可否・競合データ・収益予測をまとめています。`,
      type: "website",
    },
  };
}

function getCompetitionCount(prefecture: string): number {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "minpaku_listings.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as { listings: Array<{ address?: string }> };
    return data.listings.filter((l) => l.address?.includes(prefecture)).length;
  } catch {
    return 0;
  }
}

function getSuumoUrl(prefecture: string): string {
  const map: Record<string, string> = {
    "東京都": "https://suumo.jp/chintai/tokyo/",
    "大阪府": "https://suumo.jp/chintai/osaka/",
    "京都府": "https://suumo.jp/chintai/kyoto/",
    "愛知県": "https://suumo.jp/chintai/aichi/",
    "神奈川県": "https://suumo.jp/chintai/kanagawa/",
    "兵庫県": "https://suumo.jp/chintai/hyogo/",
    "福岡県": "https://suumo.jp/chintai/fukuoka/",
    "北海道": "https://suumo.jp/chintai/hokkaido/",
    "沖縄県": "https://suumo.jp/chintai/okinawa/",
    "長野県": "https://suumo.jp/chintai/nagano/",
    "奈良県": "https://suumo.jp/chintai/nara/",
    "広島県": "https://suumo.jp/chintai/hiroshima/",
    "千葉県": "https://suumo.jp/chintai/chiba/",
    "宮城県": "https://suumo.jp/chintai/miyagi/",
    "埼玉県": "https://suumo.jp/chintai/saitama/",
    "熊本県": "https://suumo.jp/chintai/kumamoto/",
    "栃木県": "https://suumo.jp/chintai/tochigi/",
    "静岡県": "https://suumo.jp/chintai/shizuoka/",
  };
  return map[prefecture] ?? "https://suumo.jp/chintai/";
}

export default async function PrefectureAreaPage({ params }: PageProps) {
  const { prefecture: raw } = await params;
  const prefecture = decodeURIComponent(raw);
  if (!COVERED_PREFECTURES.includes(prefecture)) notFound();

  const wards = WARD_ZONING_MAP.filter((w) => w.prefecture === prefecture);
  const competitionTotal = getCompetitionCount(prefecture);
  const suumoUrl = getSuumoUrl(prefecture);

  const tokkuWards = wards.filter((w) => w.tokkuArea);
  const wardWithTypes = wards.map((w) => {
    const info = getMinpakuInfo(w.typicalZoning, w.tokkuArea);
    const badge = getMinpakuBadgeType({ ...info, tokku: w.tokkuArea ? info.tokku : false });
    return { ...w, badge };
  });
  const relatedBlog = PREFECTURE_BLOG_MAP[prefecture];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "エリア一覧", item: `${siteUrl}/area` },
          { "@type": "ListItem", position: 3, name: `${prefecture}の民泊可否ガイド`, item: `${siteUrl}/area/${encodeURIComponent(prefecture)}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `${prefecture}で民泊はできますか？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${prefecture}では用途地域によって民泊の可否が異なります。住宅宿泊事業（年間最大180日）、特区民泊（日数制限なし）、旅館業許可（年間365日）の3種類があります。エリアごとの詳細はYADOKARIの可否チェッカーで住所を入力してご確認ください。`,
            },
          },
          {
            "@type": "Question",
            name: `${prefecture}の民泊届出住宅は何件ありますか？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `YADOKARIの届出データによると${prefecture}には${competitionTotal > 0 ? `${competitionTotal.toLocaleString("ja-JP")}件` : "複数"}の届出住宅が登録されています。競合マップでリアルタイムに確認できます。`,
            },
          },
          {
            "@type": "Question",
            name: `${prefecture}で民泊投資を始めるにはどうすればいいですか？`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `まずYADOKARIの可否チェッカーで投資したい物件の住所を入力し、住宅宿泊・特区民泊・旅館業の可否を確認します。次に競合マップで周辺の届出住宅数を把握し、収益シミュレーターで収益性を試算してから物件探しを始めましょう。`,
            },
          },
        ],
      },
    ],
  };

  return (
    <main className="bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ヘッダー */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-teal-600">トップ</Link>
            <span>/</span>
            <Link href="/area" className="hover:text-teal-600">エリア一覧</Link>
            <span>/</span>
            <span className="text-gray-700">{prefecture}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {competitionTotal > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                <TrendingUp size={12} />
                届出住宅 {competitionTotal.toLocaleString("ja-JP")}件
              </span>
            )}
            {tokkuWards.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                特区エリアあり
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {wards.length}エリア対応
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {prefecture}の民泊可否・投資ガイド
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-500 sm:text-base">
            {prefecture}のエリア別民泊可否（住宅宿泊・特区民泊・旅館業）を用途地域データから自動判定。
            住所を入力するとさらに詳しい判定と収益試算が確認できます。
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/check?q=${encodeURIComponent(prefecture)}`}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              <Shield size={16} />
              {prefecture}の住所で可否チェック
            </Link>
            <a
              href={suumoUrl}
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

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* エリア別民泊可否一覧 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{prefecture}のエリア別民泊可否</h2>
          <p className="text-sm text-gray-500 mb-6">用途地域（区レベル概算）に基づく判定です。</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wardWithTypes.map((ward) => (
              <Link
                key={ward.ward}
                href={`/area/${encodeURIComponent(ward.prefecture)}/${encodeURIComponent(ward.ward)}`}
                className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} className="text-teal-600 flex-shrink-0" />
                    <span className="font-bold text-gray-900 group-hover:text-teal-800">{ward.ward}</span>
                  </div>
                  <MinpakuBadge type={ward.badge} size="sm" />
                </div>
                {ward.tokkuArea && (
                  <span className="self-start rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    国家戦略特区
                  </span>
                )}
                <p className="text-xs leading-relaxed text-gray-500 line-clamp-2">{ward.notes}</p>
                <div className="flex items-center gap-1 text-xs font-semibold text-teal-600 group-hover:text-teal-800">
                  詳細ガイドを見る <ArrowRight size={11} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 民泊タイプ解説 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">民泊タイプ別の違い</h2>
          <p className="text-sm text-gray-500 mb-6">営業日数・許可種別・収益モデルの違いを確認してから投資判断を。</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {([
              { type: "JUUTAKU" as const, title: "住宅宿泊事業", sub: "年間180日まで", points: ["届出だけで始められる", "住居系用途地域でも可", "副業・小規模向き"] },
              { type: "TOKKU" as const, title: "特区民泊", sub: "特区エリアで日数制限なし", points: ["国家戦略特区エリアのみ", "年間365日営業可能", "最低2泊以上の設定必要"] },
              { type: "RYOKAN" as const, title: "旅館業許可", sub: "通年365日営業", points: ["許可取得が必要だが高収益", "1泊から受け入れ可", "施設基準の充足が必要"] },
            ]).map((item) => (
              <div key={item.type} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <MinpakuBadge type={item.type} />
                <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm font-medium text-teal-700">{item.sub}</p>
                <ul className="mt-4 space-y-2">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-teal-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 関連コラムリンク */}
        {relatedBlog && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{prefecture}の民泊投資ガイド</h2>
            <Link
              href={`/blog/${relatedBlog.slug}`}
              className="group flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50 px-5 py-4 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-100"
            >
              <BookOpen size={18} className="flex-shrink-0 text-teal-600" />
              <span className="text-sm font-semibold text-teal-800 group-hover:text-teal-900">{relatedBlog.title}</span>
              <ArrowRight size={14} className="ml-auto flex-shrink-0 text-teal-400 group-hover:text-teal-600" />
            </Link>
          </section>
        )}

        {/* 物件CTA */}
        <section className="rounded-2xl border border-teal-100 bg-teal-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Building2 size={18} className="text-teal-600" />
                {prefecture}の民泊物件を探す
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                住宅宿泊・特区・旅館業対応物件をYADOKARI独自データで検索
              </p>
            </div>
            <Link
              href={`/properties?prefecture=${encodeURIComponent(prefecture)}`}
              className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              物件一覧を見る
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">{prefecture}の住所で民泊可否を確認する</h2>
              <p className="mt-2 text-sm text-teal-50">
                住所を入力するだけで住宅宿泊・特区民泊・旅館業の3種類を一度に判定。収益試算も表示します。
              </p>
            </div>
            <Link
              href={`/check?q=${encodeURIComponent(prefecture)}`}
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
