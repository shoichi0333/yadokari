"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import PlanGate from "@/components/PlanGate";
import { getCurrentPlan, type PlanId } from "@/lib/plan";

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

const LAYOUTS = ["1K", "1DK", "1LDK", "2DK", "2LDK", "3LDK", "4LDK以上"];
const ZONINGS = ["商業地域", "近隣商業地域", "第一種住居地域", "第一種低層住居専用地域", "準工業地域", "その他"];
const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

const BENEFITS = [
  {
    title: "民泊投資家に直接アピール",
    description: "物件を探している投資家・運営事業者に、立地や収益化の可能性を届けられます。",
  },
  {
    title: "競合データ付きで物件の強みを訴求",
    description: "周辺の民泊市場や競合情報とあわせて、掲載物件の魅力を伝えやすくします。",
  },
  {
    title: "問い合わせを効率化",
    description: "必要な物件情報を整理して公開し、関心度の高い相手からの相談につなげます。",
  },
];

type FormState = {
  title: string;
  prefecture: string;
  city: string;
  address: string;
  rent: string;
  layout: string;
  areaSqm: string;
  ageYears: string;
  zoning: string;
  isTokkuArea: boolean;
  description: string;
  features: string;
  contactEmail: string;
  contactPhone: string;
};

const initialForm: FormState = {
  title: "", prefecture: "", city: "", address: "", rent: "", layout: "",
  areaSqm: "", ageYears: "", zoning: "", isTokkuArea: false,
  description: "", features: "", contactEmail: "", contactPhone: "",
};

export default function SubmitPropertyForm() {
  const [plan, setPlan] = useState<PlanId>(() => getCurrentPlan());
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPlan(getCurrentPlan());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (plan !== "pro") {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative h-64">
            <PlanGate
              title="物件掲載はプロプランで利用できます"
              description="プロプランではYADOKARIに物件を掲載し、投資家からの問い合わせを受け付けることができます。"
              buttonLabel="プロプランにアップグレード"
            />
          </div>
        </div>
      </main>
    );
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rent: form.rent ? Number(form.rent) : undefined,
          areaSqm: form.areaSqm ? Number(form.areaSqm) : undefined,
          ageYears: form.ageYears ? Number(form.ageYears) : undefined,
          features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
        }),
      });

      const data = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !data.id) {
        setError(data.error ?? "送信に失敗しました。入力内容を確認してください。");
        return;
      }

      setSubmittedId(data.id);
      setForm(initialForm);
    } catch {
      setError("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
              Proプラン限定機能
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">物件掲載申請</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              民泊運用に適した物件情報を入力してください。内容確認後、掲載可否を審査します。
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            ダッシュボードへ戻る
          </Link>
        </div>

        {submittedId ? (
          <section className="rounded-lg border border-emerald-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">申請を受け付けました</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  現在、審査中です。掲載可否について担当者より連絡します。
                </p>
                <p className="mt-3 text-xs font-medium text-slate-500">申請ID: {submittedId}</p>
                <button
                  type="button"
                  onClick={() => setSubmittedId(null)}
                  className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  続けて申請する
                </button>
              </div>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <section className="mb-8 rounded-lg border border-purple-100 bg-purple-50/60 p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-950">掲載でできること</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  物件情報を登録すると、YADOKARIが内容を確認したうえで公開可否をご連絡します。
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {BENEFITS.map((benefit) => (
                  <article key={benefit.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-950">{benefit.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{benefit.description}</p>
                  </article>
                ))}
              </div>
            </section>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="物件名" required>
                <input
                  required
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="例: YADOKARI 渋谷レジデンス"
                />
              </Field>

              <Field label="都道府県" required>
                <select
                  required
                  value={form.prefecture}
                  onChange={(e) => updateField("prefecture", e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              <Field label="市区町村" required>
                <input
                  required
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="例: 渋谷区"
                />
              </Field>

              <Field label="番地まで" required>
                <input
                  required
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="例: 神南1-1-1"
                />
              </Field>

              <Field label="賃料" required>
                <input
                  required
                  min={0}
                  step={1000}
                  type="number"
                  value={form.rent}
                  onChange={(e) => updateField("rent", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="例: 180000"
                />
              </Field>

              <Field label="間取り" required>
                <select
                  required
                  value={form.layout}
                  onChange={(e) => updateField("layout", e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">選択してください</option>
                  {LAYOUTS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>

              <Field label="専有面積">
                <input
                  min={0}
                  step={0.01}
                  type="number"
                  value={form.areaSqm}
                  onChange={(e) => updateField("areaSqm", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="例: 42.5"
                />
              </Field>

              <Field label="築年数">
                <input
                  min={0}
                  type="number"
                  value={form.ageYears}
                  onChange={(e) => updateField("ageYears", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="例: 12"
                />
              </Field>

              <Field label="用途地域">
                <select
                  value={form.zoning}
                  onChange={(e) => updateField("zoning", e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">選択してください</option>
                  {ZONINGS.map((z) => <option key={z} value={z}>{z}</option>)}
                </select>
              </Field>

              <Field label="連絡先メール" required>
                <input
                  required
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="owner@example.com"
                />
              </Field>

              <Field label="連絡先電話">
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="03-0000-0000"
                />
              </Field>

              <label className="flex min-h-12 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isTokkuArea}
                  onChange={(e) => updateField("isTokkuArea", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                特区エリアに該当する
              </label>

              <Field label="特徴" className="md:col-span-2">
                <input
                  value={form.features}
                  onChange={(e) => updateField("features", e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="例: 駅徒歩5分, 家具家電付き, オートロック"
                />
              </Field>

              <Field label="物件説明" required className="md:col-span-2">
                <textarea
                  required
                  rows={6}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={`${INPUT_CLASS} resize-y`}
                  placeholder="民泊運用に適したポイント、周辺環境、設備などを入力してください。"
                />
              </Field>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                戻る
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSubmitting ? "送信中" : "掲載申請を送信"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({
  label, required, className = "", children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
