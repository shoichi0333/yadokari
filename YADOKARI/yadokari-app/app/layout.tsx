import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/lib/AuthContext";
import { ToastProvider } from "@/lib/ToastContext";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "YADOKARI（ヤドカリ）",
    template: "%s | YADOKARI",
  },
  description: "住所1つで民泊可否を即判定。住宅宿泊事業・特区民泊・旅館業の3タイプを自動判別し、競合届出住宅数・収益試算まで無料で確認。全国対応。",
  applicationName: "YADOKARI（ヤドカリ）",
  keywords: ["民泊", "民泊可否チェック", "民泊物件", "特区民泊", "住宅宿泊事業", "旅館業", "民泊投資", "YADOKARI", "競合分析"],
  openGraph: {
    title: "YADOKARI（ヤドカリ）",
    description: "住所1つで民泊可否を即判定。競合分析・収益試算まで無料で確認。全国対応。",
    siteName: "YADOKARI（ヤドカリ）",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "YADOKARI（ヤドカリ）",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <AuthProvider>
        <ToastProvider>
          <Header />
          <main className="flex-1 mb-16 md:mb-0">{children}</main>
          <BottomNav />
          <footer className="bg-gray-900 text-gray-400 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-10">
                <div className="col-span-2 sm:col-span-1">
                  <Link href="/" className="mb-3 inline-block text-xl font-black tracking-[0.08em] text-white">
                    YADOKARI
                  </Link>
                  <p className="text-gray-500 text-xs leading-relaxed">民泊可否チェック・競合分析・収益試算。全国対応・無料で使える。</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">ツール</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/check" className="hover:text-white transition-colors">可否チェッカー</Link></li>
                    <li><Link href="/map" className="hover:text-white transition-colors">競合マップ</Link></li>
                    <li><Link href="/properties" className="hover:text-white transition-colors">物件を探す</Link></li>
                    <li><Link href="/search" className="hover:text-white transition-colors">エリアを探す</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">コンテンツ</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/blog" className="hover:text-white transition-colors">民泊コラム</Link></li>
                    <li><Link href="/area" className="hover:text-white transition-colors">エリア可否ガイド</Link></li>
                    <li><Link href="/faq" className="hover:text-white transition-colors">よくある質問</Link></li>
                    <li><a href="https://www.mlit.go.jp/kankocho/minpaku/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">民泊制度（国交省）</a></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">サービス</p>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/pricing" className="hover:text-white transition-colors">料金プラン</Link></li>
                    <li><Link href="/submit-property" className="hover:text-white transition-colors">物件を掲載する</Link></li>
                    <li><Link href="/auth/register" className="hover:text-white transition-colors">無料登録</Link></li>
                    <li><Link href="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
                    <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-6 text-xs text-gray-600 text-center">
                © 2026 YADOKARI. All rights reserved. ／ 本サービスの判定結果はあくまで参考情報です。正確な情報は各自治体にご確認ください。
              </div>
            </div>
          </footer>
        </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
