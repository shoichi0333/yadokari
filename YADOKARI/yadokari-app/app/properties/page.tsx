import type { Metadata } from "next";
import { Suspense } from "react";
import PropertiesClient from "./PropertiesClient";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const firstValue = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const allValues = (v: string | string[] | undefined): string[] =>
  Array.isArray(v) ? v : v ? [v] : [];

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const prefecture = firstValue(params.prefecture);
  const minpakuType = firstValue(params.minpakuType);

  const typeLabel =
    minpakuType === "JUUTAKU"
      ? "住宅宿泊事業"
      : minpakuType === "TOKKU"
        ? "特区民泊"
        : minpakuType === "RYOKAN"
          ? "旅館業"
          : "";

  const prefLabel = prefecture && prefecture !== "ALL" ? prefecture : "全国";
  const title = [prefLabel, typeLabel, "民泊物件一覧"].filter(Boolean).join(" ");

  return {
    title: `${title} | YADOKARI`,
    description: `${prefLabel}の民泊運営可能物件を検索・一覧表示。住宅宿泊事業・特区民泊・旅館業対応物件をタグや条件で絞り込み。`,
  };
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "トップ", item: "https://yadokari.jp" },
    { "@type": "ListItem", position: 2, name: "物件を探す", item: "https://yadokari.jp/properties" },
  ],
};

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams;

  const defaultValues = {
    keyword: firstValue(params.keyword) ?? "",
    prefecture: firstValue(params.prefecture) ?? "ALL",
    layout: firstValue(params.layout) ?? "ALL",
    minpakuType: firstValue(params.minpakuType) ?? "ALL",
    maxRent: firstValue(params.maxRent) ?? "",
    tags: allValues(params.tags),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Suspense fallback={<div className="p-8 text-center text-gray-400">読み込み中...</div>}>
        <PropertiesClient defaultValues={defaultValues} />
      </Suspense>
    </>
  );
}
