"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, History, MapPin, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getCheckHistory, clearCheckHistory, type CheckHistoryEntry } from "@/lib/checkHistory";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading, plan } = useAuth();
  const [history, setHistory] = useState<CheckHistoryEntry[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login?next=/favorites");
    }
  }, [loading, router, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getCheckHistory());
  }, []);

  function handleClear() {
    clearCheckHistory();
    setHistory([]);
  }

  if (loading || !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 transition-colors hover:text-teal-600">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <History size={20} className="text-teal-600" />
            <h1 className="text-xl font-bold text-gray-900">チェック履歴</h1>
          </div>
          <span className="text-sm text-gray-400">{history.length}件</span>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
            {plan === "free" ? "無料: 3件まで" : "有料: 拡張履歴"}
          </span>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-red-200 hover:text-red-600"
          >
            <Trash2 size={12} />
            全件削除
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-24 text-center">
          <History size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="mb-2 font-medium text-gray-500">チェック履歴がありません</p>
          <p className="mb-6 text-sm text-gray-400">
            可否チェッカーで住所を検索すると、ここに履歴が残ります
          </p>
          <Link
            href="/check"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-700"
          >
            可否チェッカーを使う
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={`${entry.address}-${entry.checkedAt}`}
              className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-teal-600" />
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-teal-800">
                      {entry.address}
                    </p>
                    {entry.ward && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {entry.prefecture} {entry.ward}
                      </p>
                    )}
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {new Date(entry.checkedAt).toLocaleDateString("ja-JP")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <EligBadge label="住宅宿泊" enabled={entry.juutaku} />
                <EligBadge label="特区民泊" enabled={entry.tokku} />
                <EligBadge label="旅館業" enabled={entry.ryokan} />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href={`/check?q=${encodeURIComponent(entry.address)}`}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-bold text-gray-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  再判定する
                </Link>
                <Link
                  href={`/report?address=${encodeURIComponent(entry.address)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-700"
                >
                  <FileText size={14} />
                  レポート作成
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EligBadge({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        enabled
          ? "border-green-100 bg-green-50 text-green-700"
          : "border-gray-100 bg-gray-50 text-gray-400"
      }`}
    >
      {enabled ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
      {label}
    </span>
  );
}
