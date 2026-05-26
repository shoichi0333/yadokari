"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getAuthFetchHeaders } from "@/lib/authFetch";

type ListingStatus = "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED";

type AdminListing = {
  id: string;
  title: string;
  address: string;
  prefecture: string;
  city: string;
  rent: number;
  layout: string;
  areaSqm: number;
  ageYears: number | null;
  zoning: string | null;
  isTokkuArea: boolean;
  description: string;
  features: string[];
  contactEmail: string;
  contactPhone: string | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    name: string;
    plan: string;
  };
};

const STATUS_LABELS: Record<ListingStatus, string> = {
  PENDING: "審査待ち",
  ACTIVE: "公開中",
  REJECTED: "却下",
  EXPIRED: "非公開",
};

const STATUS_STYLES: Record<ListingStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  EXPIRED: "border-slate-200 bg-slate-100 text-slate-600",
};

const FILTERS: Array<{ value: ListingStatus | "ALL"; label: string }> = [
  { value: "PENDING", label: "審査待ち" },
  { value: "ACTIVE", label: "公開中" },
  { value: "REJECTED", label: "却下" },
  { value: "EXPIRED", label: "非公開" },
  { value: "ALL", label: "すべて" },
];

const EMPTY_COUNTS: Record<ListingStatus, number> = {
  PENDING: 0,
  ACTIVE: 0,
  REJECTED: 0,
  EXPIRED: 0,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRent(value: number) {
  return `${value.toLocaleString("ja-JP")}円/月`;
}

function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminListingsClient() {
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<ListingStatus | "ALL">("PENDING");
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [counts, setCounts] = useState<Record<ListingStatus, number>>(EMPTY_COUNTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    if (loading) return;

    if (!user) {
      setIsLoading(false);
      setError("管理画面の利用にはログインが必要です。");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const query = status === "ALL" ? "" : `?status=${status}`;
      const response = await fetch(`/api/admin/listings${query}`, {
        headers: await getAuthFetchHeaders(),
      });
      const data = (await response.json().catch(() => null)) as
        | { listings?: AdminListing[]; counts?: Record<ListingStatus, number>; error?: string }
        | null;

      if (!response.ok || !data?.listings) {
        throw new Error(data?.error ?? "掲載申請を取得できませんでした。");
      }

      setListings(data.listings);
      setCounts(data.counts ?? EMPTY_COUNTS);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "掲載申請を取得できませんでした。");
      setListings([]);
      setCounts(EMPTY_COUNTS);
    } finally {
      setIsLoading(false);
    }
  }, [loading, status, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchListings();
  }, [fetchListings]);

  async function updateStatus(id: string, nextStatus: ListingStatus) {
    setUpdatingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(await getAuthFetchHeaders()),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await response.json().catch(() => null)) as
        | { listing?: AdminListing; error?: string }
        | null;

      if (!response.ok || !data?.listing) {
        throw new Error(data?.error ?? "掲載申請を更新できませんでした。");
      }

      await fetchListings();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "掲載申請を更新できませんでした。");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-700"
            >
              <ArrowLeft size={16} />
              ダッシュボードへ戻る
            </Link>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <ShieldAlert size={22} />
              </span>
              <div>
                <p className="text-sm font-semibold text-teal-700">Admin</p>
                <h1 className="text-3xl font-black tracking-normal text-slate-950">掲載申請管理</h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Proユーザーから届いた物件掲載申請を確認し、公開・却下・非公開を管理します。公開中にした申請だけが公開APIの対象になります。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(STATUS_LABELS) as ListingStatus[]).map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold text-slate-500">{STATUS_LABELS[item]}</p>
                <p className="mt-1 text-xl font-black text-slate-950">{counts[item]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const active = filter.value === status;
            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  active
                    ? "bg-teal-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-700"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => void fetchListings()}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-teal-200 hover:text-teal-700"
          >
            再読み込み
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <Loader2 className="animate-spin text-teal-600" size={28} />
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <Clock3 className="mx-auto text-slate-300" size={42} />
            <p className="mt-4 text-lg font-black text-slate-900">対象の掲載申請はありません</p>
            <p className="mt-2 text-sm text-slate-500">新しい申請が届いたらここに表示されます。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <article key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={listing.status} />
                      <span className="text-xs font-semibold text-slate-400">申請: {formatDate(listing.createdAt)}</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-950">{listing.title}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {listing.prefecture} {listing.city} {listing.address}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{formatRent(listing.rent)}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{listing.layout}</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1">{listing.areaSqm}㎡</span>
                      {listing.zoning && <span className="rounded-full bg-slate-100 px-2.5 py-1">{listing.zoning}</span>}
                      {listing.isTokkuArea && <span className="rounded-full bg-teal-50 px-2.5 py-1 text-teal-700">特区エリア</span>}
                    </div>
                    <p className="mt-4 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-slate-700">{listing.description}</p>
                    {listing.features.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {listing.features.map((feature) => (
                          <span key={feature} className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                      <p>申請者: {listing.user.name}</p>
                      <p>アカウント: {listing.user.email}</p>
                      <p>連絡先: {listing.contactEmail}</p>
                      <p>電話: {listing.contactPhone || "未入力"}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                    <button
                      type="button"
                      disabled={updatingId === listing.id || listing.status === "ACTIVE"}
                      onClick={() => void updateStatus(listing.id, "ACTIVE")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} />
                      公開する
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === listing.id || listing.status === "REJECTED"}
                      onClick={() => void updateStatus(listing.id, "REJECTED")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      却下する
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === listing.id || listing.status === "EXPIRED"}
                      onClick={() => void updateStatus(listing.id, "EXPIRED")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      非公開
                    </button>
                    <Link
                      href={`/properties?keyword=${encodeURIComponent(listing.address)}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      関連確認
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
