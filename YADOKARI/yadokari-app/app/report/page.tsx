import type { Metadata } from "next";
import { Suspense } from "react";
import ReportClient from "./ReportClient";

export const metadata: Metadata = {
  title: "民泊詳細レポート | YADOKARI",
  description:
    "住所ごとの民泊可否、競合件数、収益目安、次に確認すべき実務項目をまとめたYADOKARIの詳細レポート。",
};

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">読み込み中...</div>}>
      <ReportClient />
    </Suspense>
  );
}
