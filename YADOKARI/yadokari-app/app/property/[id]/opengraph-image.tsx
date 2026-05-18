import { ImageResponse } from "next/og";
import { getPropertyById } from "@/lib/data/properties";
import type { MinpakuType } from "@/lib/minpaku";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const MINPAKU_LABELS: Record<MinpakuType, string> = {
  JUUTAKU: "住宅宿泊事業",
  TOKKU: "特区民泊",
  RYOKAN: "旅館業許可",
  NG: "民泊不可",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Image({ params }: Props) {
  const { id } = await params;
  const property = getPropertyById(id);
  const title = property?.title ?? "物件が見つかりません";
  const address = property?.address ?? "YADOKARI";
  const rent = property ? `${formatRent(property.rent)} / 月` : "";
  const minpakuType = property ? MINPAKU_LABELS[property.minpakuType] : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0d9488 0%, #059669 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            maxWidth: "980px",
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: 0,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              fontSize: 30,
              fontWeight: 500,
              lineHeight: 1.35,
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <div>{address}</div>
            <div
              style={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              {rent && <span>{rent}</span>}
              {minpakuType && <span>{minpakuType}</span>}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: 0,
            color: "rgba(255, 255, 255, 0.88)",
          }}
        >
          YADOKARI
        </div>
      </div>
    ),
    size,
  );
}

function formatRent(rent: number) {
  const rentInMan = rent / 10000;
  const formatted = rentInMan.toFixed(rent % 10000 === 0 ? 0 : 1);
  return `${formatted}万円`;
}
