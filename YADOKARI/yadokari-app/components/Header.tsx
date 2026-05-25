"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, History, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-5">
          {/* ロゴ */}
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="text-xl font-black tracking-[0.08em] text-teal-700 transition-colors group-hover:text-teal-800">
              YADOKARI
            </span>
            <span className="hidden whitespace-nowrap border-l border-gray-200 pl-3 text-xs font-semibold leading-5 text-gray-400 lg:block">
              可否判定・競合分析・収益試算
            </span>
          </Link>

          {/* デスクトップナビ */}
          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-5 md:flex">
            <Link href="/check" className="whitespace-nowrap text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors">
              可否チェッカー
            </Link>
            <Link href="/properties" className="whitespace-nowrap text-sm text-gray-600 hover:text-teal-700 transition-colors">
              物件候補
            </Link>
            <Link href="/search" className="whitespace-nowrap text-sm text-gray-600 hover:text-teal-700 transition-colors">
              エリアを探す
            </Link>
            <Link href="/map" className="whitespace-nowrap text-sm text-gray-600 hover:text-teal-700 transition-colors">
              届出マップ
            </Link>
            <Link href="/blog" className="whitespace-nowrap text-sm text-gray-600 hover:text-teal-700 transition-colors">
              コラム
            </Link>
            <Link href="/pricing" className="whitespace-nowrap rounded-full bg-teal-50 px-3.5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100 transition-colors">
              料金プラン
            </Link>
            {user && (
              <Link href="/dashboard" className="whitespace-nowrap text-sm text-gray-600 hover:text-teal-700 transition-colors">
                ダッシュボード
              </Link>
            )}
          </nav>

          {/* CTAボタン */}
          <div className="hidden flex-shrink-0 items-center gap-3 md:flex">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-teal-700 transition-colors"
                >
                  <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                    <User size={13} className="text-teal-700" />
                  </div>
                  <span className="max-w-[80px] truncate">{user.name}</span>
                  <ChevronDown size={12} className="text-gray-400" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    <Link
                      href="/favorites"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <History size={13} className="text-teal-600" />
                      チェック履歴
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut size={13} className="text-gray-400" />
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="whitespace-nowrap text-sm text-gray-600 hover:text-teal-700 transition-colors">
                  ログイン
                </Link>
                <Link href="/auth/register" className="whitespace-nowrap bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
                  無料登録
                </Link>
              </>
            )}
          </div>

          {/* モバイルメニュー */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* モバイルメニュー展開 */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3">
          <Link href="/check" className="block text-sm font-semibold text-teal-700 py-2" onClick={() => setMenuOpen(false)}>
            可否チェッカー
          </Link>
          <Link href="/properties" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
            物件候補
          </Link>
          <Link href="/search" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
            エリアを探す
          </Link>
          <Link href="/map" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
            届出マップ
          </Link>
          <Link href="/blog" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
            コラム
          </Link>
          <Link href="/pricing" className="block rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700" onClick={() => setMenuOpen(false)}>
            料金プラン
          </Link>
          {user ? (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <p className="text-xs text-gray-400">{user.email}</p>
              <Link href="/favorites" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                チェック履歴
              </Link>
              <Link href="/dashboard" className="block text-sm text-gray-700 py-2" onClick={() => setMenuOpen(false)}>
                ダッシュボード
              </Link>
              <button
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full text-left text-sm text-gray-700 py-2"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex-1 text-sm border border-gray-200 py-2 rounded-lg text-gray-600 text-center">
                ログイン
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="flex-1 text-sm bg-teal-600 text-white py-2 rounded-lg text-center">
                無料登録
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
