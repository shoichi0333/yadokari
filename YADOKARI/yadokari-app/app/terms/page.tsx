import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "利用規約 | YADOKARI",
  },
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <header className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">利用規約</h1>
          <p className="mt-4 text-sm text-gray-500">制定日: 2026年5月13日</p>
        </header>

        <div className="space-y-8 text-base leading-8 text-gray-700">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">1. サービス概要</h2>
            <p>
              YADOKARI（以下「当サービス」といいます）は、民泊運営可能な物件情報の検索および関連情報の提供を目的とした不動産検索サービスです。
            </p>
            <p className="mt-3">
              掲載情報は、利用者の物件検討を支援するための参考情報であり、契約条件、法令適合性、許認可の取得可否を保証するものではありません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">2. 禁止事項</h2>
            <p>利用者は、当サービスの利用にあたり、以下の行為を行ってはなりません。</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>法令または公序良俗に反する行為</li>
              <li>当サービスまたは第三者の権利、利益、名誉を侵害する行為</li>
              <li>虚偽または不正確な情報を送信する行為</li>
              <li>不正アクセス、過度な負荷をかける行為、その他運営を妨害する行為</li>
              <li>当サービスの情報を無断で複製、転載、再配布する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">3. 免責事項</h2>
            <p>
              当サービスは、掲載情報の正確性、最新性、有用性、適法性について可能な限り確認に努めますが、その完全性を保証するものではありません。
            </p>
            <p className="mt-3">
              利用者は自己の責任において当サービスを利用するものとし、物件契約、民泊運営、許認可申請その他の判断については、必要に応じて専門家または関係機関に確認してください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">4. 準拠法</h2>
            <p>本規約の解釈および適用は、日本法に準拠します。</p>
          </section>
        </div>
      </article>
    </div>
  );
}
