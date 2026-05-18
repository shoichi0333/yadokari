import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "民泊に関するよくある質問 | YADOKARI",
  description: "民泊（住宅宿泊事業・特区民泊・旅館業）に関するよくある質問と回答。用途地域・法規制・届出手続き・収益などについてまとめました。",
};

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "民泊とは何ですか？",
    answer: "民泊とは、住宅（一戸建て・マンションなど）を旅行者等に有料で提供する宿泊サービスです。日本では「住宅宿泊事業法（民泊新法）」「旅館業法」「国家戦略特区法」の3種類の法律に基づいて運営されます。",
  },
  {
    question: "住宅宿泊事業と特区民泊と旅館業の違いは？",
    answer: "住宅宿泊事業（民泊新法）は届出制で年間最大180日まで営業でき、住居系用途地域でも可能です。特区民泊は国家戦略特区エリアのみで日数制限なく営業でき、最低宿泊日数は2泊以上。旅館業許可は許可取得が必要で年間365日営業でき、1泊から受け入れ可能です。",
  },
  {
    question: "民泊ができない用途地域はありますか？",
    answer: "工業地域と工業専用地域では民泊（住宅宿泊事業・特区民泊・旅館業）のすべてが禁止されています。また、第一種・第二種低層住居専用地域では住宅宿泊事業のみ可能で、特区民泊・旅館業は実質的に困難です。",
  },
  {
    question: "民泊を始めるにはどんな手続きが必要ですか？",
    answer: "住宅宿泊事業の場合は都道府県への届出が必要です。特区民泊は特区を指定する自治体との認定申請が必要です。旅館業許可は保健所への許可申請が必要で、施設基準（採光・換気・客室面積等）を満たす必要があります。",
  },
  {
    question: "民泊の収益はどのくらい見込めますか？",
    answer: "エリアの競合密度と民泊種別によって異なります。競合が少ないエリアでは宿泊単価12,000円・稼働率62%程度、競合が多いエリアでは8,500円・40%程度が目安です。YADOKARIの可否チェッカーで住所を入力すると、エリアの競合密度に応じた収益試算が確認できます。",
  },
  {
    question: "国家戦略特区とはどこですか？",
    answer: "主な特区民泊エリアは、東京都大田区、大阪府（浪速区・中央区・北区・西区など）、新潟市、千葉市、北九州市などです。特区エリアでは年間180日の制限なく営業でき、最低宿泊日数は2泊以上が条件です。",
  },
  {
    question: "マンションでも民泊はできますか？",
    answer: "マンションで民泊を行うには、管理規約で民泊が禁止されていないことが必要です。多くのマンションでは管理組合が民泊を禁止しているため、まず管理規約を確認してください。用途地域の可否確認はYADOKARIのチェッカーで行えます。",
  },
  {
    question: "民泊の年間180日制限はどう計算しますか？",
    answer: "住宅宿泊事業法では、1つの住宅（届出番号）あたり年間提供日数の上限が180日です。提供日数は実際に宿泊者に提供した日数で計算します。1日に複数組が宿泊しても1日とカウントします。",
  },
  {
    question: "民泊の税金・確定申告はどうなりますか？",
    answer: "民泊収入は事業所得または雑所得として確定申告が必要です。年間20万円超の所得がある場合は確定申告が義務です。経費（清掃費・アメニティ・プラットフォーム手数料など）を差し引いた純利益に課税されます。詳細は税理士にご相談ください。",
  },
  {
    question: "YADOKARIの民泊可否判定はどこまで正確ですか？",
    answer: "YADOKARIは区・市レベルの用途地域データをもとに概算判定を行っています。同じ区内でも用途地域は細かく分かれており、実際の判定は番地単位で異なる場合があります。正確な判定は市区町村窓口または不動産会社にご確認ください。あくまでも参考情報としてご利用ください。",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <main className="bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-teal-600">トップ</Link>
            <span>/</span>
            <span className="text-gray-700">よくある質問</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            民泊に関するよくある質問
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-base">
            住宅宿泊事業法・特区民泊・旅館業に関するよくある質問をまとめました。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-base font-semibold text-gray-900 hover:text-teal-700 [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown
                  size={18}
                  className="flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="border-t border-gray-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-gray-600">
                {item.answer}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">実際に物件の住所で可否確認する</h2>
              <p className="mt-2 text-sm text-teal-50">
                住所を入力するだけで住宅宿泊・特区民泊・旅館業の可否と収益試算を表示します。
              </p>
            </div>
            <Link
              href="/check"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
            >
              <Shield size={16} />
              可否チェッカーへ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
