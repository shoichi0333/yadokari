import type { Metadata } from "next";
import ListingsClient from "./ListingsClient";
import { loadListings } from "@/lib/data/listings";

export const metadata: Metadata = {
  title: "公式届出済み民泊施設一覧/マップ | YADOKARI",
  description:
    "住宅宿泊事業法などの公式届出済み民泊施設を一覧と地図で確認。周辺の賃貸物件探しやYADOKARI分析へつなげられます。",
};

export default async function ListingsPage() {
  const data = await loadListings();
  return <ListingsClient data={data} />;
}
