import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "物件詳細は準備中 | YADOKARI",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PropertyDetailPage() {
  redirect("/properties");
}
