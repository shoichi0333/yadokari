import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "プライバシーポリシー | YADOKARI",
  },
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <header className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            プライバシーポリシー
          </h1>
          <p className="mt-4 text-sm text-gray-500">制定日: 2026年5月13日</p>
        </header>

        <div className="space-y-8 text-base leading-8 text-gray-700">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">1. 収集する情報</h2>
            <p>
              YADOKARI（以下「当サービス」といいます）は、サービス提供に必要な範囲で、以下の情報を収集することがあります。
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>お問い合わせフォームに入力された氏名、メールアドレス、お問い合わせ内容</li>
              <li>IPアドレス、ブラウザ情報、閲覧日時、参照元URLなどのアクセスログ</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">2. 利用目的</h2>
            <p>当サービスは、収集した情報を以下の目的で利用します。</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>お問い合わせへの回答および必要な連絡のため</li>
              <li>サービスの提供、維持、改善のため</li>
              <li>不正利用の防止、セキュリティ確保のため</li>
              <li>アクセス状況の分析および利便性向上のため</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">3. 第三者提供</h2>
            <p>
              当サービスは、法令に基づく場合を除き、利用者本人の同意なく個人情報を第三者に提供しません。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">4. クッキー</h2>
            <p>
              当サービスでは、利用状況の把握や利便性向上のためにクッキーを使用する場合があります。利用者はブラウザの設定によりクッキーを無効にできますが、一部機能が利用できない場合があります。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">5. お問い合わせ先</h2>
            <p>
              本ポリシーに関するお問い合わせは、以下のメールアドレスまでご連絡ください。
            </p>
            <p className="mt-3">
              <a className="text-teal-700 underline-offset-4 hover:underline" href="mailto:araki3312@gmail.com">
                araki3312@gmail.com
              </a>
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
