"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { login } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [notice] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("registered") === "1"
      ? "メール確認が完了しました。登録したメールアドレスとパスワードでログインしてください。"
      : "";
  });
  const [loading, setLoading] = useState(false);
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const registerHref = nextPath
    ? `/auth/register?next=${encodeURIComponent(nextPath)}`
    : "/auth/register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!user) {
        setError("メールアドレスまたはパスワードが正しくありません。確認メールが未完了の場合は、先にメール内のリンクを開いてください。");
        return;
      }
      await refresh();
      router.push(nextPath || "/");
    } catch {
      setError("メールアドレスまたはパスワードが正しくありません。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <Image src="/yadokari-logo.png" alt="YADOKARI" width={108} height={72} className="h-10 w-auto" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">ログイン</h1>
          <p className="text-gray-500 text-sm mt-1">アカウントにサインインしてください</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {notice && (
            <div className="mb-5 flex gap-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-800">
              <MailCheck size={18} className="mt-0.5 flex-shrink-0 text-teal-600" />
              <p>{notice}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">メールアドレス</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">パスワード</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6文字以上"
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPass ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-60"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            アカウントをお持ちでない方は{" "}
            <Link href={registerHref} className="text-teal-600 font-medium hover:underline">
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
