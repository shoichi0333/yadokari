import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResultsClient from "./SearchResultsClient";

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const keyword = firstValue(params.keyword)?.trim();
  const prefecture = firstValue(params.prefecture)?.trim();
  const titleParts = [
    prefecture && prefecture !== "ALL" ? prefecture : undefined,
    keyword || undefined,
  ].filter(Boolean);

  return {
    title: titleParts.length > 0 ? `${titleParts.join(" ")}の民泊物件 | YADOKARI` : "民泊物件を検索 | YADOKARI",
    description: `民泊運営可能な物件を条件で絞り込んで検索できます。${prefecture && prefecture !== "ALL" ? `${prefecture}の` : "全国の"}住宅宿泊事業・特区民泊・旅館業対応物件を一覧表示。`,
  };
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "トップ", item: "https://yadokari.jp" },
    { "@type": "ListItem", position: 2, name: "エリアを探す", item: "https://yadokari.jp/search" },
  ],
};

export default function SearchPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Suspense fallback={<div className="p-8 text-center text-gray-400">読み込み中...</div>}>
        <SearchResultsClient />
      </Suspense>
    </>
  );
}
