"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">エラーが発生しました</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          申し訳ありません。予期しないエラーが発生しました。
          しばらく待ってから再試行してください。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"
          >
            <RefreshCw size={16} />
            再試行する
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <Home size={16} />
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
