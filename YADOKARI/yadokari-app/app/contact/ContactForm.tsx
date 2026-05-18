"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const SUBJECT_OPTIONS = [
  "民泊可否について",
  "料金・プランについて",
  "物件情報について",
  "その他",
] as const;

type Subject = (typeof SUBJECT_OPTIONS)[number];

type FormState = {
  name: string;
  email: string;
  subject: Subject;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "民泊可否について",
  message: "",
};

const inputClass =
  "w-full rounded-lg border border-teal-100 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100";

export default function ContactForm() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address") ?? "";
  const initialState = useMemo<FormState>(() => {
    if (!address) return initialForm;

    return {
      ...initialForm,
      subject: "民泊可否について",
      message: `${address} の民泊可否・収益性について相談したいです。\n\n確認したいこと:\n・この住所で進めるべき制度\n・想定収益と初期費用\n・届出や許可に必要な実務ステップ\n`,
    };
  }, [address]);
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string; fallback?: boolean };

      if (!response.ok || !data.ok) {
        setError(data.error ?? "送信に失敗しました。入力内容をご確認ください。");
        return;
      }

      setSuccess(true);
      setForm(address ? initialState : initialForm);
    } catch {
      setError("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-teal-700">CONTACT</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            お問い合わせ
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            民泊可否、料金プラン、物件情報などについてお気軽にお問い合わせください。
          </p>
          {address && (
            <div className="mt-5 inline-flex max-w-full items-center rounded-full border border-teal-100 bg-white px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              相談対象: <span className="ml-1 truncate">{address}</span>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { void handleSubmit(e); }}
          className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-800">お名前</span>
              <input
                required
                name="name"
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={`${inputClass} mt-2`}
                placeholder="山田 太郎"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-800">メールアドレス</span>
              <input
                required
                name="email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className={`${inputClass} mt-2`}
                placeholder="name@example.com"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-800">お問い合わせ種別</span>
              <select
                name="subject"
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value as Subject)}
                className={`${inputClass} mt-2`}
              >
                {SUBJECT_OPTIONS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-800">お問い合わせ内容</span>
              <textarea
                required
                name="message"
                value={form.message}
                onChange={(event) => updateField("message", event.target.value)}
                className={`${inputClass} mt-2 min-h-40 resize-y`}
                placeholder="お問い合わせ内容をご入力ください"
              />
            </label>
          </div>

          {success ? (
            <p className="mt-6 rounded-lg bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-700">
              {success ? "送信が完了しました！" : null}
            </p>
          ) : null}

          {error ? (
            <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-w-36 items-center justify-center rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
            >
              {isSubmitting ? "送信中..." : "送信する"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
