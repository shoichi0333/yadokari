import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
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
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>
            物件検索は準備中
          </div>
          <div style={{ maxWidth: "880px", fontSize: 32, lineHeight: 1.35, color: "rgba(255,255,255,0.9)" }}>
            YADOKARIでは審査済み物件だけを公開する準備を進めています。
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 34, fontWeight: 800 }}>
          YADOKARI
        </div>
      </div>
    ),
    size,
  );
}
