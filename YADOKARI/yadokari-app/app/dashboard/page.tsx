"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  FileText,
  History,
  MapPin,
  Search,
  Settings2,
  Shield,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getPlanLimits, PLAN_LABELS } from "@/lib/plan";
import { getCheckHistory, type CheckHistoryEntry } from "@/lib/checkHistory";
import { deleteSavedReport, getSavedReports, syncDeleteSavedReport, type SavedReport } from "@/lib/savedReports";
import { getAuthFetchHeaders } from "@/lib/authFetch";

function formatLimit(value: number | null) {
  return value === null ? "無制限" : `${value}件`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, plan, loading } = useAuth();
  const [history, setHistory] = useState<CheckHistoryEntry[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getCheckHistory());
    setSavedReports(getSavedReports());
  }, []);

  useEffect(() => {
    if (!user) return;
    void getAuthFetchHeaders().then((headers) =>
      fetch("/api/admin/check", { headers })
        .then((r) => r.json())
        .then((data: { isAdmin?: boolean }) => setIsAdmin(data.isAdmin === true))
        .catch(() => setIsAdmin(false)),
    );
  }, [user]);

  const limits = getPlanLimits(plan);

  if (loading || !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <p className="text-sm text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ヘッダー */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-sm text-gray-500">{user.name}さんの利用状況</p>
        </div>
        {plan === "free" ? (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            プランをアップグレード
            <ArrowRight size={16} />
          </Link>
        ) : (
          <Link
            href="/billing"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-200 hover:bg-teal-50"
          >
            プラン・課金管理
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* プラン＆統計 */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <section className="col-span-2 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">現在のプラン</p>
              <div className="mt-2 flex items-center gap-2">
                <Crown size={22} className="text-teal-600" />
                <p className="text-2xl font-bold text-gray-900">{PLAN_LABELS[plan]}</p>
              </div>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {plan.toUpperCase()}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">チェック回数</p>
              <p className="mt-1 text-sm font-bold text-gray-900">
                {limits.checksPerDay === null ? "無制限" : `${limits.checksPerDay}回/日`}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">履歴保存</p>
              <p className="mt-1 text-sm font-bold text-gray-900">{formatLimit(limits.history)}</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-xs text-gray-500">レポート保存</p>
              <p className="mt-1 text-sm font-bold text-gray-900">{formatLimit(limits.savedReports)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <History size={22} className="text-teal-600" />
          <p className="mt-4 text-sm text-gray-500">チェック履歴</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{history.length}件</p>
          <p className="mt-1 text-xs text-gray-400">
            上限: {formatLimit(limits.history)}
          </p>
          <Link href="/favorites" className="mt-2 block text-xs font-semibold text-teal-600 hover:text-teal-800">
            履歴を見る →
          </Link>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <FileText size={22} className="text-teal-600" />
          <p className="mt-4 text-sm text-gray-500">保存レポート</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{savedReports.length}件</p>
          <p className="mt-1 text-xs text-gray-400">
            上限: {formatLimit(limits.savedReports)}
          </p>
          <Link href="/report" className="mt-2 block text-xs font-semibold text-teal-600 hover:text-teal-800">
            新規作成 →
          </Link>
        </section>
      </div>

      {/* 有料導線 */}
      <section className="mb-8 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-emerald-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-teal-700">
              <Crown size={13} />
              {plan === "free" ? "次に解放できる機能" : "利用中の有料機能"}
            </div>
            <h2 className="text-lg font-black text-gray-950">
              詳細レポートで、候補住所を事業判断まで進める
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              チェック履歴からレポートを作成し、実質利益・初期費用・消防/管理規約チェックまで整理できます。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={history[0] ? `/report?address=${encodeURIComponent(history[0].address)}` : "/report"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
            >
              最新履歴でレポート作成
              <FileText size={15} />
            </Link>
            {plan === "free" && (
              <Link
                href="/pricing?source=dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-5 py-3 text-sm font-bold text-teal-700 transition-colors hover:bg-teal-50"
              >
                詳細版を解放
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* クイックアクション */}
      <div className={`mb-8 grid grid-cols-1 gap-4 ${isAdmin ? "sm:grid-cols-4 lg:grid-cols-5" : "sm:grid-cols-4"}`}>
        <Link
          href="/check"
          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-teal-200"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Shield size={20} />
            </span>
            <span>
              <span className="block font-bold text-gray-900">可否チェッカー</span>
              <span className="text-sm text-gray-500">住所を入力して即判定</span>
            </span>
          </span>
          <ArrowRight size={18} className="text-gray-300" />
        </Link>

        <Link
          href="/map"
          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-teal-200"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <MapPin size={20} />
            </span>
            <span>
              <span className="block font-bold text-gray-900">届出マップ</span>
              <span className="text-sm text-gray-500">公式届出済み施設を地図で確認</span>
            </span>
          </span>
          <ArrowRight size={18} className="text-gray-300" />
        </Link>

        <Link
          href="/properties"
          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-teal-200"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Search size={20} />
            </span>
            <span>
              <span className="block font-bold text-gray-900">物件候補</span>
              <span className="text-sm text-gray-500">外部リンクとYADOKARI分析を見る</span>
            </span>
          </span>
          <ArrowRight size={18} className="text-gray-300" />
        </Link>

        <Link
          href="/report"
          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-teal-200"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <FileText size={20} />
            </span>
            <span>
              <span className="block font-bold text-gray-900">詳細レポート</span>
              <span className="text-sm text-gray-500">収支と実務タスクを整理</span>
            </span>
          </span>
          <ArrowRight size={18} className="text-gray-300" />
        </Link>

        {isAdmin && (
          <Link
            href="/admin/listings"
            className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm transition-colors hover:border-amber-200"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Settings2 size={20} />
              </span>
              <span>
                <span className="block font-bold text-gray-900">掲載申請管理</span>
                <span className="text-sm text-gray-500">審査・公開操作</span>
              </span>
            </span>
            <ArrowRight size={18} className="text-gray-300" />
          </Link>
        )}
      </div>

      {/* 保存レポート */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">保存した詳細レポート</h2>
          </div>
          {plan === "free" && (
            <Link href="/pricing?source=dashboard" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              保存機能を解放
            </Link>
          )}
        </div>

        {plan === "free" ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
            <Crown size={36} className="mx-auto text-amber-600" />
            <p className="mt-4 font-bold text-amber-950">レポート保存は有料プランで利用できます</p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              無料プランでは詳細レポートのプレビューまで。保存、再閲覧、PDF出力はスタンダード以上で解放されます。
            </p>
            <Link
              href="/pricing?source=dashboard"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              保存機能を解放
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : savedReports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
            <FileText size={36} className="mx-auto text-gray-200" />
            <p className="mt-4 font-bold text-gray-900">保存済みレポートはまだありません</p>
            <p className="mt-2 text-sm text-gray-500">詳細レポートを作成して保存すると、ここから再確認できます。</p>
            <Link
              href={history[0] ? `/report?address=${encodeURIComponent(history[0].address)}` : "/report"}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              レポートを作成
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {savedReports.slice(0, 6).map((report) => (
              <div key={`${report.address}-${report.createdAt}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{report.address}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {[report.prefecture, report.ward].filter(Boolean).join(" ")}
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-bold text-teal-700">
                    {report.score}/100
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-gray-500">推奨制度</p>
                    <p className="mt-1 font-bold text-gray-900">{report.recommendedType}</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-gray-500">月間売上</p>
                    <p className="mt-1 font-bold text-gray-900">
                      {report.monthlyRevenueMin && report.monthlyRevenueMax
                        ? `${report.monthlyRevenueMin}〜${report.monthlyRevenueMax}万円`
                        : "要確認"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href={`/report?address=${encodeURIComponent(report.address)}`}
                    className="rounded-lg bg-teal-600 px-3 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-teal-700"
                  >
                    開く
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSavedReports(deleteSavedReport(report.address));
                      if (user.email) {
                        void syncDeleteSavedReport(user.email, report.address);
                      }
                    }}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* チェック履歴 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={20} className="text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">最近チェックしたエリア</h2>
          </div>
          <Link href="/favorites" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
            すべて見る
          </Link>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
            <Shield size={40} className="mx-auto text-gray-200" />
            <p className="mt-4 font-bold text-gray-900">まだチェック履歴がありません</p>
            <p className="mt-2 text-sm text-gray-500">可否チェッカーで住所を検索すると、ここに表示されます。</p>
            <Link
              href="/check"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
            >
              可否チェッカーを使う
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 6).map((entry) => (
              <div
                key={`${entry.address}-${entry.checkedAt}`}
                className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 flex-shrink-0 text-teal-600" />
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-teal-800">
                    {entry.address}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <EligBadge label="住宅宿泊" enabled={entry.juutaku} />
                  <EligBadge label="特区民泊" enabled={entry.tokku} />
                  <EligBadge label="旅館業" enabled={entry.ryokan} />
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(entry.checkedAt).toLocaleDateString("ja-JP")}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/check?q=${encodeURIComponent(entry.address)}`}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-center text-xs font-bold text-gray-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                  >
                    再判定
                  </Link>
                  <Link
                    href={`/report?address=${encodeURIComponent(entry.address)}`}
                    className="rounded-lg bg-teal-600 px-3 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-teal-700"
                  >
                    レポート
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EligBadge({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        enabled ? "border-green-100 bg-green-50 text-green-700" : "border-gray-100 bg-gray-50 text-gray-400"
      }`}
    >
      {enabled ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
      {label}
    </span>
  );
}
