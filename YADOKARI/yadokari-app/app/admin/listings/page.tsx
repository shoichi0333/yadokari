import type { Metadata } from "next";
import AdminListingsClient from "./AdminListingsClient";

export const metadata: Metadata = {
  title: "掲載申請管理 | YADOKARI",
  description: "YADOKARIの物件掲載申請を審査・公開管理する管理者画面です。",
};

export default function AdminListingsPage() {
  return <AdminListingsClient />;
}
