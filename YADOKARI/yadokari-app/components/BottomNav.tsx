"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, Home, Map, CheckSquare, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/", label: "ホーム", icon: Home },
  { href: "/check", label: "可否チェック", icon: CheckSquare },
  { href: "/properties", label: "物件候補", icon: Building2 },
  { href: "/map", label: "届出マップ", icon: Map },
  { href: "/pricing", label: "料金", icon: Crown },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 pb-4 pt-2 shadow-[0_-4px_18px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 px-1 py-1 text-[11px] font-semibold transition-colors ${
                active ? "text-teal-600" : "text-gray-500 hover:text-teal-600"
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 2} />
              <span className="leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
