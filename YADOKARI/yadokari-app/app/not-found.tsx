import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Home size={36} className="text-teal-500" />
        </div>
        <h1 className="text-6xl font-bold text-teal-600 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-3">ページが見つかりません</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          お探しのページは削除されたか、URLが変更されている可能性があります。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            <Home size={16} />
            トップへ戻る
          </Link>
          <Link
            href="/properties"
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <Search size={16} />
            物件を探す
          </Link>
        </div>
      </div>
    </div>
  );
}
