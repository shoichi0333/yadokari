"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Mail, Phone, X } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getAuthFetchHeaders } from "@/lib/authFetch";
import ActiveListingCard, { type PublicListing } from "./ActiveListingCard";

type ContactInfo = { contactEmail: string; contactPhone?: string };

export default function ActiveListingsSection() {
  const { user } = useAuth();
  const [listings, setListings] = useState<PublicListing[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [contactModal, setContactModal] = useState<{ id: string; info?: ContactInfo; loading: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/listings")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setListings(data as PublicListing[]);
      })
      .catch(() => setListings([]))
      .finally(() => setLoaded(true));
  }, []);

  async function handleContact(id: string) {
    if (!user) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent("/properties")}`;
      return;
    }
    setContactModal({ id, loading: true });
    try {
      const headers = await getAuthFetchHeaders();
      const res = await fetch(`/api/listings/${id}/contact`, { headers });
      const data = (await res.json()) as ContactInfo | { error?: string };
      if ("contactEmail" in data) {
        setContactModal({ id, info: data, loading: false });
      } else {
        setContactModal(null);
      }
    } catch {
      setContactModal(null);
    }
  }

  if (!loaded || listings.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
          <BadgeCheck size={18} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-950">オーナー掲載物件</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            YADOKARIが審査した掲載物件（{listings.length}件）
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ActiveListingCard key={listing.id} listing={listing} onContact={handleContact} />
        ))}
      </div>

      {contactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-950">問い合わせ先</h3>
              <button
                type="button"
                onClick={() => setContactModal(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {contactModal.loading ? (
              <p className="py-4 text-center text-sm text-gray-500">読み込み中...</p>
            ) : contactModal.info ? (
              <div className="space-y-3">
                <a
                  href={`mailto:${contactModal.info.contactEmail}`}
                  className="flex items-center gap-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100"
                >
                  <Mail size={16} />
                  {contactModal.info.contactEmail}
                </a>
                {contactModal.info.contactPhone && (
                  <a
                    href={`tel:${contactModal.info.contactPhone}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Phone size={16} />
                    {contactModal.info.contactPhone}
                  </a>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  物件に関するお問い合わせは直接オーナーへ。
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
