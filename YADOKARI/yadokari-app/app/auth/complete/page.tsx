"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Home, LogIn } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

type CompleteState = "loading" | "complete" | "fallback" | "error";

function getHashParam(name: string) {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  return new URLSearchParams(hash).get(name);
}

export default function AuthCompletePage() {
  const { refresh } = useAuth();
  const [state, setState] = useState<CompleteState>("loading");
  const [message, setMessage] = useState("登録情報を確認しています。");

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      const errorDescription =
        getHashParam("error_description") ||
        new URLSearchParams(window.location.search).get("error_description");

      if (errorDescription) {
        if (!cancelled) {
          setState("error");
          setMessage(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
        }
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        if (!cancelled) {
          setState("fallback");
          setMessage("登録は完了しています。ログイン画面から続けてください。");
        }
        return;
      }

      const accessToken = getHashParam("access_token");
      const refreshToken = getHashParam("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          if (!cancelled) {
            setState("error");
            setMessage("確認リンクの処理に失敗しました。ログイン画面からお試しください。");
          }
          return;
        }

        window.history.replaceState(null, "", "/auth/complete");
      }

      const { data } = await supabase.auth.getSession();
      await refresh();

      if (!cancelled) {
        if (data.session) {
          setState("complete");
          setMessage("登録が完了しました。YADOKARIをご利用いただけます。");
        } else {
          setState("fallback");
          setMessage("登録は完了しています。ログイン画面から続けてください。");
        }
      }
    }

    void completeAuth();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const isError = state === "error";
  const isLoading = state === "loading";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <section className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center text-center">
        <Link href="/" className="mb-8 inline-flex items-center justify-center">
          <Image src="/yadokari-logo.png" alt="YADOKARI" width={132} height={88} className="h-12 w-auto" />
        </Link>

        <div className="w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
              isError ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-600"
            }`}
          >
            <CheckCircle2 size={28} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {isLoading ? "確認中です" : isError ? "確認できませんでした" : "登録完了しました！"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>

          <div className="mt-8 space-y-3">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              <Home size={16} />
              ホーム画面へ
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <LogIn size={16} />
              ログイン画面へ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
