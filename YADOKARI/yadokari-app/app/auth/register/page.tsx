"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { register } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("パスワードは6文字以上で設定してください");
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const user = await register(email, password, name);
      if (!user) {
        setError("登録に失敗しました。入力内容を確認してください");
        return;
      }
      await refresh();
      router.push("/");
    } catch {
      setError("登録に失敗しました。入力内容を確認してください");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "お気に入り物件を保存・管理",
    "収益シミュレーション結果を保存",
    "新着物件のメール通知",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <Image src="/yadokari-logo.png" alt="YADOKARI" width={108} height={72} className="h-10 w-auto" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">無料で始める</h1>
          <p className="text-gray-500 text-sm mt-1">アカウントを作成して民泊投資を始めましょう</p>
        </div>

        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-5">
          <ul className="space-y-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-teal-800">
                <CheckCircle2 size={14} className="text-teal-600 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                メールアドレス
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                パスワード
              </label>
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
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">6文字以上で設定してください</p>
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
              登録することで利用規約・プライバシーポリシーに同意したものとみなします
            </p>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/auth/login" className="text-teal-600 font-medium hover:underline">
              ログイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
