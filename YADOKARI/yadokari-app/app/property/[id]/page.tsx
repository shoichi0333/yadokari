import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Train, Home, ExternalLink, Shield, Info } from "lucide-react";
import { getPropertyById, PROPERTIES } from "@/lib/data/properties";
import { getMinpakuInfo } from "@/lib/minpaku";
import { WARD_ZONING_MAP } from "@/lib/data/wardZoning";
import MinpakuBadge from "@/components/MinpakuBadge";
import RevenueSimulator from "@/components/RevenueSimulator";
import FavoriteButton from "@/components/FavoriteButton";
import ContactModal from "@/components/ContactModal";
import PropertyCard from "@/components/PropertyCard";
import MapEmbed from "./MapEmbed";
import PropertyImageGallery from "./PropertyImageGallery";

export async function generateStaticParams() {
  return PROPERTIES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = getPropertyById(id);
  if (!property) return { title: "物件が見つかりません | YADOKARI" };
  const minpakuLabel = getMetadataMinpakuLabel(property.minpakuType);

  const ogImage = property.images[0];
  return {
    title: `${property.title} ${minpakuLabel} | YADOKARI`,
    description: `${property.title}は${property.address}の${minpakuLabel}物件です。${property.description}`,
    openGraph: {
      title: `${property.title} ${minpakuLabel} | YADOKARI`,
      description: `${property.address}の${minpakuLabel}物件。賃料${(property.rent / 10000).toFixed(0)}万円・${property.layout}。民泊運営シミュレーター付き。`,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 800, alt: property.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.title} ${minpakuLabel} | YADOKARI`,
      description: `${property.address}の${minpakuLabel}物件。賃料${(property.rent / 10000).toFixed(0)}万円・${property.layout}。`,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = getPropertyById(id);
  if (!property) notFound();

  const minpakuInfo = getMinpakuInfo(property.zoning, property.isTokkuArea);
  const relatedProperties = PROPERTIES
    .filter((candidate) => candidate.prefecture === property.prefecture && candidate.id !== property.id)
    .slice(0, 3);

  const matchedWard = WARD_ZONING_MAP.find(
    (w) => w.prefecture === property.prefecture && w.ward === property.city
  );
  const areaHref = matchedWard
    ? `/area/${encodeURIComponent(property.prefecture)}/${encodeURIComponent(property.city)}`
    : `/area/${encodeURIComponent(property.prefecture)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "トップ", item: "https://yadokari.jp" },
          { "@type": "ListItem", position: 2, name: "物件一覧", item: "https://yadokari.jp/properties" },
          { "@type": "ListItem", position: 3, name: property.title, item: `https://yadokari.jp/property/${property.id}` },
        ],
      },
      {
        "@type": "Apartment",
        name: property.title,
        description: property.description,
        address: {
          "@type": "PostalAddress",
          addressLocality: property.city,
          addressRegion: property.prefecture,
          addressCountry: "JP",
          streetAddress: property.address,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: property.lat,
          longitude: property.lng,
        },
        floorSize: {
          "@type": "QuantitativeValue",
          value: property.areaSqm,
          unitCode: "MTK",
        },
        numberOfRooms: property.layout,
        petsAllowed: property.features.some((f) => f.includes("ペット")),
        amenityFeature: property.features.map((f) => ({
          "@type": "LocationFeatureSpecification",
          name: f,
          value: true,
        })),
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 注意バナー */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
        <Info size={14} className="flex-shrink-0" />
        <span>物件情報は参考データです。最新の空室・賃料は</span>
        <a href={`https://suumo.jp/jj/chintai/ichiran/FR301FC001/?ar=030&bs=040&fw=${encodeURIComponent(property.address)}`} target="_blank" rel="noreferrer" className="font-semibold underline hover:text-amber-900">SUUMOで確認</a>
        <span>してください。</span>
      </div>

      {/* パンくずリスト */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <Home size={12} />トップ
        </Link>
        <span>/</span>
        <Link href="/properties" className="hover:text-teal-600">物件一覧</Link>
        <span>/</span>
        <span className="text-gray-700 truncate">{property.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 写真ギャラリー */}
          <PropertyImageGallery images={property.images} title={property.title} />

          {/* 物件基本情報 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex flex-wrap items-start gap-3 mb-3">
              <MinpakuBadge type={property.minpakuType} />
              {property.isTokkuArea && (
                <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2 py-1 rounded-full">
                  国家戦略特区エリア
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>

            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
              <MapPin size={14} />
              <span>{property.address}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100">
              <InfoBlock label="賃料" value={`${(property.rent / 10000).toFixed(property.rent % 10000 === 0 ? 0 : 1)}万円/月`} highlight />
              <InfoBlock label="間取り" value={property.layout} />
              {isPresent(property.areaSqm) && <InfoBlock label="専有面積" value={`${property.areaSqm}㎡`} />}
              {isPresent(property.ageYears) && <InfoBlock label="築年数" value={`築${property.ageYears}年`} />}
              {isPresent(property.floor) && isPresent(property.buildingFloors) && (
                <InfoBlock label="所在階" value={`${property.floor}階/${property.buildingFloors}階建`} />
              )}
              {isPresent(property.nearestStation) && isPresent(property.minutesToStation) && (
                <InfoBlock label="最寄り駅" value={`${property.nearestStation}駅 徒歩${property.minutesToStation}分`} />
              )}
              <InfoBlock label="用途地域" value={property.zoning} />
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mt-4">{property.description}</p>
          </div>

          {/* 設備・特徴 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">設備・特徴</h2>
            <div className="flex flex-wrap gap-2">
              {property.features.map((f) => (
                <span
                  key={f}
                  className="text-sm text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* エリアガイドリンク */}
          <div className="bg-teal-50 rounded-2xl border border-teal-100 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-teal-700 mb-1">エリアガイド</p>
                <p className="text-sm font-bold text-gray-900">
                  {property.prefecture}{matchedWard ? property.city : ""}の民泊可否・投資情報
                </p>
                <p className="text-xs text-gray-500 mt-1">用途地域・競合データ・収益ガイドを確認</p>
              </div>
              <Link
                href={areaHref}
                className="flex-shrink-0 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                エリアを見る
                <MapPin size={14} />
              </Link>
            </div>
          </div>

          {/* 民泊運営情報 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-teal-600" /> 民泊運営情報
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">運営形態</p>
                  <MinpakuBadge type={property.minpakuType} />
                  <p className="text-xs text-gray-500 mt-2">{property.minpakuNote}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MinpakuInfoCard
                  label="住宅宿泊事業"
                  available={minpakuInfo.juutaku}
                  detail="年間180日上限・届出のみ"
                />
                <MinpakuInfoCard
                  label="国家戦略特区"
                  available={minpakuInfo.tokku}
                  detail="日数制限なし・特区エリア限定"
                />
                <MinpakuInfoCard
                  label="旅館業許可"
                  available={minpakuInfo.ryokan}
                  detail="日数制限なし・許可申請が必要"
                />
              </div>

              <div className="text-xs text-gray-400 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <strong className="text-amber-700">ご注意：</strong>
                民泊の可否は用途地域だけでなく、建物の構造・管理規約・自治体条例等によっても異なります。
                実際の運営前に必ず各自治体の窓口でご確認ください。
                <a
                  href="https://www.mlit.go.jp/kankocho/minpaku/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 ml-1 inline-flex items-center gap-0.5"
                >
                  民泊制度ポータル <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* 地図 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 mb-4">地図・周辺情報</h2>
            <MapEmbed lat={property.lat} lng={property.lng} title={property.title} />
            {isPresent(property.nearestStation) && isPresent(property.minutesToStation) && (
              <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-3">
                <Train size={14} />
                <span>{property.nearestStation}駅 徒歩{property.minutesToStation}分</span>
              </div>
            )}
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-5">
          {/* 問い合わせカード */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-teal-700">
                {(property.rent / 10000).toFixed(property.rent % 10000 === 0 ? 0 : 1)}
                <span className="text-lg">万円</span>
              </div>
              <div className="text-gray-400 text-xs">/ 月（管理費別）</div>
            </div>

            <div className="space-y-2 mb-4">
              <ContactModal property={property} />
              <FavoriteButton propertyId={property.id} showLabel />
            </div>

            <div className="text-xs text-gray-400 text-center">
              物件情報は随時更新されます。最新情報は必ずお問い合わせください。
            </div>
          </div>

          {/* 収益シミュレーター */}
          <RevenueSimulator propertyRent={property.rent} maxDays={property.maxDays} />
        </div>
      </div>

      {relatedProperties.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-5">{property.prefecture}の他の物件</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedProperties.map((relatedProperty) => (
              <PropertyCard key={relatedProperty.id} property={relatedProperty} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function getMetadataMinpakuLabel(type: "JUUTAKU" | "TOKKU" | "RYOKAN" | "NG") {
  switch (type) {
    case "JUUTAKU":
      return "民泊可（住宅宿泊）";
    case "TOKKU":
      return "民泊可（特区民泊）";
    case "RYOKAN":
      return "民泊可（旅館業許可）";
    case "NG":
      return "民泊不可";
  }
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== "";
}

function InfoBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`font-semibold text-sm ${highlight ? "text-teal-700 text-base" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function MinpakuInfoCard({ label, available, detail }: { label: string; available: boolean; detail: string }) {
  return (
    <div className={`p-3 rounded-xl border ${available ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-gray-50"}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`text-sm ${available ? "text-emerald-600" : "text-gray-400"}`}>
          {available ? "✓" : "✕"}
        </span>
        <span className={`text-xs font-medium ${available ? "text-emerald-800" : "text-gray-400"}`}>
          {label}
        </span>
      </div>
      <p className="text-xs text-gray-500">{detail}</p>
    </div>
  );
}
