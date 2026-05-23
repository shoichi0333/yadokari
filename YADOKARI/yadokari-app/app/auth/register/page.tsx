"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle2, MailCheck } from "lucide-react";
import { register, isSupabaseEnabled } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!name.trim()) {
      setError("お名前を入力してください。");
      return;
    }

    if (password.length < 6) {
      setError("パスワードは6文字以上で設定してください。");
      return;
    }

    setLoading(true);
    try {
      const user = await register(email, password, name);
      if (!user) {
        setError("登録を完了できませんでした。すでに登録済みの場合はログインしてください。");
        return;
      }

      await refresh();

      if (isSupabaseEnabled()) {
        const supabase = getSupabaseClient();
        const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
        if (!data.session) {
          setNotice("確認メールを送信しました。メール内のリンクを開いて登録を完了してください。");
          return;
        }
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました。入力内容を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "お気に入り物件を保存・管理できます",
    "収益シミュレーション結果を保存できます",
    "有料プランの詳細レポートを利用できます",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <Image src="/yadokari-logo.png" alt="YADOKARI" width={108} height={72} className="h-10 w-auto" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">無料で始める</h1>
          <p className="text-gray-500 text-sm mt-1">アカウントを作成して民泊投資の調査を始めましょう</p>
        </div>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-5">
          <ul className="space-y-2">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2 text-sm text-teal-800">
                <CheckCircle2 size={14} className="text-teal-600 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {notice ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                <MailCheck size={24} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">確認メールを送信しました</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">{notice}</p>
              <p className="mt-3 text-xs leading-5 text-gray-400">
                メールが見つからない場合は、迷惑メールフォルダも確認してください。
              </p>
              <Link
                href="/auth/login"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
              >
                ログイン画面へ
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">お名前</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 太郎"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

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
                <p className="text-xs text-gray-400 mt-1">6文字以上で設定してください。</p>
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
                {loading ? "登録中..." : "無料で登録する"}
              </button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                登録すると、利用規約とプライバシーポリシーに同意したものとみなされます。
              </p>
            </form>
          )}

          {!notice && (
            <div className="mt-6 text-center text-sm text-gray-500">
              すでにアカウントをお持ちの方は{" "}
              <Link href="/auth/login" className="text-teal-600 font-medium hover:underline">
                ログイン
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
