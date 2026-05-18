import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, TrendingUp, Shield, MapPin, CheckCircle2, Database, BookOpen, Clock, User, Building2, Briefcase } from "lucide-react";
import SearchForm from "@/components/SearchForm";
import MinpakuBadge from "@/components/MinpakuBadge";
import FeaturedPropertiesTabs from "@/app/FeaturedPropertiesTabs";
import { BLOG_POSTS } from "@/lib/data/blogPosts";
import { PROPERTIES } from "@/lib/data/properties";

export const metadata: Metadata = {
  title: "YADOKARI | 民泊可否チェック・競合分析・収益試算 | 全国対応",
  description: "住所1つで民泊の可否を即判定。住宅宿泊事業・特区民泊・旅館業の3タイプを自動判別し、競合届出住宅数・収益試算まで無料で確認できます。全国2,000件超のデータ掲載。",
  openGraph: {
    title: "YADOKARI | 民泊可否チェック・競合分析・収益試算",
    description: "住所1つで民泊可否を即判定。競合マップ・収益シミュレーター搭載。全国対応・無料で使えます。",
    type: "website",
    url: "https://yadokari.jp",
  },
  twitter: {
    card: "summary_large_image",
    title: "YADOKARI | 民泊可否チェック・競合分析・収益試算",
    description: "住所1つで民泊可否を即判定。競合マップ・収益シミュレーター搭載。",
  },
};

type MinpakuListingsData = {
  totalCount: number;
  listings: Array<{
    prefecture?: string | null;
  }>;
};

function getMinpakuListingStats() {
  const filePath = path.join(process.cwd(), "public", "data", "minpaku_listings.json");
  const rawData = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(rawData) as MinpakuListingsData;
  const listings = Array.isArray(data.listings) ? data.listings : [];
  const prefectureCount = new Set(
    listings
      .map((listing) => listing.prefecture)
      .filter((prefecture): prefecture is string => Boolean(prefecture))
  ).size;

  return {
    totalCount: typeof data.totalCount === "number" ? data.totalCount : listings.length,
    prefectureCount,
  };
}

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "YADOKARI（ヤドカリ）",
  url: "https://yadokari.jp",
  description: "民泊できるエリアを正確に探す。届出データで競合分析・可否チェッカー・収益シミュレーター搭載。",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://yadokari.jp/check?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '民泊（ホームシェアリング）を始めるには何が必要ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '民泊を始めるには、物件の用途地域確認、住宅宿泊事業法の届出（または旅館業許可）、物件オーナーまたは管理組合の同意、火災保険の加入が必要です。YADOKARIの可否チェッカーで住所を入力すると、3種類の民泊形態の可否をすぐに確認できます。',
      },
    },
    {
      '@type': 'Question',
      name: '住宅宿泊事業と旅館業の違いは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '住宅宿泊事業（民泊新法）は届出だけで始められ、年間180日を上限として運営できます。旅館業許可は手続きが複雑ですが日数制限なく運営でき、収益最大化が狙えます。国家戦略特区民泊は特定エリア限定で日数制限なく運営できる制度です。',
      },
    },
    {
      '@type': 'Question',
      name: '民泊の収益はどのくらいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '民泊収益は立地、間取り、稼働率、運営形態によって大きく異なります。東京・大阪などの都市部では月10万〜30万円の収益を目指せるケースもありますが、管理費・清掃費・プラットフォーム手数料を差し引いた実質収益で判断することが重要です。YADOKARIの収益シミュレーターで試算できます。',
      },
    },
    {
      '@type': 'Question',
      name: 'どのエリアが民泊に向いていますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '東京都港区・台東区（浅草）・渋谷区、大阪市中央区・浪速区（難波）、京都市下京区・東山区（祇園）、沖縄県那覇市などが民泊の需要が高いエリアです。競合届出住宅数や稼働率を考慮してエリアを選ぶことが重要で、YADOKARIの競合マップで詳細を確認できます。',
      },
    },
  ],
};

export default function TopPage() {
  const { totalCount, prefectureCount } = getMinpakuListingStats();
  const formattedTotalCount = totalCount.toLocaleString("ja-JP");

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-10">
            <p className="text-white/70 text-xs font-bold tracking-[0.2em] uppercase mb-4">YADOKARI</p>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
              <Shield size={12} />
              住宅宿泊事業法・旅館業法対応
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
              住所1つで、民泊の可否を<br className="hidden sm:block" />
              <span className="text-emerald-300">すぐに調べる。</span>
            </h1>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-5 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm sm:text-base">
              <Database size={16} />
              全国{formattedTotalCount}件の民泊届出住宅を掲載
            </div>
            <p className="text-teal-100 text-base sm:text-lg max-w-2xl mx-auto">
              可否チェック・競合分析・収益シミュレーションを一気通貫で。政府公開データで全国エリアをカバー。
            </p>
          </div>

          <SearchForm />

          {/* CTAボタン */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link
              href="/check"
              className="flex items-center gap-2 bg-white text-teal-700 font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-teal-50 transition-colors shadow-sm"
            >
              <Shield size={14} />
              可否チェッカーを試す
            </Link>
            {[
              { href: "/map", label: "競合マップを見る" },
              { href: "/properties", label: "物件を探す" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors text-white text-sm px-4 py-2 rounded-full border border-white/20"
              >
                {item.label}
                <ArrowRight size={12} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 統計バナー */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CounterCard
              icon={<Database size={22} />}
              value={`${formattedTotalCount}件`}
              label="届出住宅掲載"
            />
            <CounterCard
              icon={<MapPin size={22} />}
              value={`${prefectureCount}都道府県`}
              label="全国対応"
            />
            <CounterCard
              icon={<Shield size={22} />}
              value="3種類"
              label="住宅宿泊・特区・旅館業を判別"
            />
          </div>
        </div>
      </section>

      {/* あなたに合った使い方 */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">
              あなたのニーズに合わせて使う
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              4つのユーザーペルソナに合わせた導線を用意しています
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <SegmentCard
              icon={<User size={24} />}
              title="民泊を始めたい個人"
              description="自宅や物件が民泊できるか、まず法規チェック。用途地域と特区情報で可否を即確認できます"
              ctaLabel="可否チェッカーを試す"
              href="/check"
              accent="teal"
            />
            <SegmentCard
              icon={<Building2 size={24} />}
              title="民泊運営代行会社"
              description="全国のエリア別競合密度データで営業先を効率リサーチ。届出件数で有望エリアを特定できます"
              ctaLabel="エリア分析を始める"
              href="/search"
              accent="blue"
            />
            <SegmentCard
              icon={<TrendingUp size={24} />}
              title="不動産投資家"
              description="収益シミュレーターで実質利回りを試算。競合マップで供給過多エリアを事前に回避できます"
              ctaLabel="競合マップを見る"
              href="/map"
              accent="emerald"
            />
            <SegmentCard
              icon={<Briefcase size={24} />}
              title="民泊可能物件を探す法人"
              description="社員研修・福利厚生用の民泊物件を全国から条件検索。住宅宿泊・旅館業対応物件を一覧で確認"
              ctaLabel="物件一覧を見る"
              href="/properties"
              accent="purple"
            />
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-10">
            YADOKARIが選ばれる理由
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="text-teal-600" size={28} />}
              title="民泊可否を自動判定"
              description="用途地域データをもとに、住宅宿泊・特区民泊・旅館業の可否を自動表示。法令チェックの手間を省きます。"
            />
            <FeatureCard
              icon={<TrendingUp className="text-teal-600" size={28} />}
              title="収益シミュレーター内蔵"
              description="宿泊単価・稼働率・経費を入力するだけで月次利益や実質利回りをリアルタイム計算。"
            />
            <FeatureCard
              icon={<MapPin className="text-teal-600" size={28} />}
              title="競合マップで戦略立案"
              description="政府公開の届出住宅データをリアルタイム表示。エリアの競合密度を把握して、差別化戦略を立てられます。"
            />
          </div>
        </div>
      </section>

      {/* 使い方3ステップ */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-10">
            使い方3ステップ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StepCard
              icon={<MapPin className="text-teal-600" size={28} />}
              step="01"
              title="エリアを選ぶ"
              description="競合マップで届出住宅の密度を確認。収益が見込めるエリアを絞り込む。"
            />
            <StepCard
              icon={<Shield className="text-teal-600" size={28} />}
              step="02"
              title="法規制を確認"
              description="住宅宿泊・特区・旅館業の可否を一覧で比較。自分に合う営業スタイルを選ぶ。"
            />
            <StepCard
              icon={<TrendingUp className="text-teal-600" size={28} />}
              step="03"
              title="物件・エリアを選んで動く"
              description="物件一覧で条件絞り込み、エリア分析で有望地域を特定。外部不動産サイトへの直リンクも完備。"
            />
          </div>
        </div>
      </section>

      {/* 民泊タイプ解説 */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-2">
            民泊の種別を選んで検索
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            営業日数の制限や許可の種類によって、収益モデルが変わります
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MinpakuTypeCard
              type="JUUTAKU"
              title="住宅宿泊事業"
              subtitle="年間180日まで"
              description="届出だけで始められる最もシンプルな民泊。副業感覚でスタートしやすい。"
              href="/search?minpakuType=JUUTAKU"
              checks={["届出のみ（許可不要）", "住居専用地域でも可", "既存の住宅・賃貸物件で運営可能"]}
            />
            <MinpakuTypeCard
              type="TOKKU"
              title="国家戦略特区民泊"
              subtitle="日数制限なし"
              description="特定エリア限定。最低2泊以上の設定が必要だが日数制限なしで高収益を狙える。"
              href="/search?minpakuType=TOKKU"
              checks={["年間365日営業可能", "特区認定エリア限定", "大田区・大阪市・北九州市など"]}
            />
            <MinpakuTypeCard
              type="RYOKAN"
              title="旅館業許可"
              subtitle="日数制限なし"
              description="許可取得のハードルは高いが、日数制限なしで最大限の収益を追求できる。"
              href="/search?minpakuType=RYOKAN"
              checks={["1泊からの受け入れ可", "年間365日営業可能", "施設基準を満たす必要あり"]}
            />
          </div>
        </div>
      </section>

      {/* 民泊コラムセクション */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">民泊コラム</h2>
              <p className="text-gray-500 text-sm mt-1">民泊の始め方・法規制・エリアガイドを解説</p>
            </div>
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900">
              全記事を見る <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...BLOG_POSTS].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()).slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition-all hover:border-teal-200 hover:bg-white hover:shadow-md"
              >
                {post.imageUrl && (
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={10} />
                      {post.readingMinutes}分
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal-600 group-hover:text-teal-800">
                    <BookOpen size={12} />
                    続きを読む
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* おすすめ物件 */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">おすすめ民泊物件</h2>
              <p className="text-gray-500 text-sm mt-1">住宅宿泊・特区・旅館業対応の物件をタイプ別に確認</p>
            </div>
            <Link href="/properties" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900">
              全件を見る <ArrowRight size={14} />
            </Link>
          </div>
          <FeaturedPropertiesTabs properties={PROPERTIES} />
        </div>
      </section>

      {/* よくある質問 */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">よくある質問</h2>
            <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900">
              すべてのFAQを見る <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {faqJsonLd.mainEntity.map((faq) => (
              <div key={faq.name} className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="font-bold text-gray-900">{faq.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {faq.acceptedAnswer.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 届出住宅マップ CTA */}
      <section className="py-10 bg-gradient-to-r from-teal-700 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/10 rounded-xl p-3 flex-shrink-0">
              <Database size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">競合マップで分析する <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 align-middle">NEW</span></h2>
              <p className="text-teal-100 text-sm leading-relaxed">
                政府公開の届出住宅データを地図上に可視化。東京都港区843件・静岡県498件など、エリア別の競合密度を把握できます。
              </p>
            </div>
          </div>
          <Link
            href="/map"
            className="flex-shrink-0 flex items-center gap-2 bg-white text-teal-700 font-semibold px-6 py-3 rounded-xl hover:bg-teal-50 transition-colors text-sm"
          >
            競合マップを見る <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}


function CounterCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-teal-100 bg-white p-5 shadow-lg shadow-teal-900/5">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-gray-900">{value}</div>
        <div className="text-sm font-medium text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-xl border border-gray-100 bg-gray-50 transition-all hover:border-teal-200 hover:bg-white hover:shadow-md">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  icon, step, title, description,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center rounded-xl border border-gray-100 bg-white px-6 pb-6 pt-10 shadow-sm transition-all hover:border-teal-200 hover:shadow-md">
      <div className="absolute left-1/2 top-0 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-lg shadow-teal-900/15">
        {step}
      </div>
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function MinpakuTypeCard({
  type, title, subtitle, description, href, checks,
}: {
  type: "JUUTAKU" | "TOKKU" | "RYOKAN";
  title: string;
  subtitle: string;
  description: string;
  href: string;
  checks: string[];
}) {
  return (
    <Link href={href} className="group block bg-white rounded-xl border border-gray-100 p-6 hover:border-teal-200 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <MinpakuBadge type={type} />
        <ArrowRight size={14} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-teal-600 text-sm font-medium mb-3">{subtitle}</p>
      <p className="text-gray-500 text-sm mb-4 leading-relaxed">{description}</p>
      <ul className="space-y-1.5">
        {checks.map((check) => (
          <li key={check} className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle2 size={12} className="text-teal-500 flex-shrink-0" />
            {check}
          </li>
        ))}
      </ul>
    </Link>
  );
}

type SegmentAccent = "teal" | "blue" | "emerald" | "purple";

const segmentAccentClasses: Record<SegmentAccent, { icon: string; cta: string }> = {
  teal: {
    icon: "bg-teal-50 text-teal-600",
    cta: "text-teal-600 hover:text-teal-700",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600",
    cta: "text-blue-600 hover:text-blue-700",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    cta: "text-emerald-600 hover:text-emerald-700",
  },
  purple: {
    icon: "bg-purple-50 text-purple-600",
    cta: "text-purple-600 hover:text-purple-700",
  },
};

function SegmentCard({
  icon, title, description, ctaLabel, href, accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  accent: SegmentAccent;
}) {
  const classes = segmentAccentClasses[accent];

  return (
    <Link href={href} className="group block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5">
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${classes.icon}`}>
        {icon}
      </div>
      <h3 className="mb-3 font-bold text-gray-900">{title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-gray-500">{description}</p>
      <span className={`inline-flex items-center gap-1 text-sm font-semibold no-underline ${classes.cta}`}>
        {ctaLabel}
        <ArrowRight size={12} />
      </span>
    </Link>
  );
}
