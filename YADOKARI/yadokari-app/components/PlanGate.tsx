"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

type PlanGateProps = {
  title?: string;
  description?: string;
  buttonLabel?: string;
  href?: string;
  className?: string;
};

export default function PlanGate({
  title = "この機能は有料プランで利用できます",
  description = "プランをアップグレードすると、保存数や掲載機能を拡張できます。",
  buttonLabel = "プランをアップグレード",
  href = "/pricing",
  className = "",
}: PlanGateProps) {
  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-white/70 px-4 backdrop-blur-sm ${className}`}
    >
      <div className="max-w-sm rounded-2xl border border-white/70 bg-white/90 p-6 text-center shadow-xl shadow-gray-900/10">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <Lock size={22} />
        </div>
        <p className="text-base font-bold text-gray-900">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{description}</p>
        <Link
          href={href}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
