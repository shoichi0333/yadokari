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
          position: "relative",
          padding: "72px",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -120,
            top: -160,
            width: 520,
            height: 520,
            borderRadius: 260,
            background: "#ccfbf1",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -180,
            bottom: -220,
            width: 620,
            height: 620,
            borderRadius: 310,
            background: "#d1fae5",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 96,
            top: 86,
            display: "flex",
            gap: 18,
          }}
        >
          {["可否判定", "競合分析", "収益試算"].map((label) => (
            <div
              key={label}
              style={{
                borderRadius: 999,
                background: "white",
                border: "2px solid #ccfbf1",
                color: "#0f766e",
                fontSize: 24,
                fontWeight: 800,
                padding: "14px 22px",
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            borderRadius: 34,
            background: "white",
            border: "1px solid #e2e8f0",
            padding: "56px 64px",
            boxShadow: "0 28px 80px rgba(15, 23, 42, 0.12)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: 38,
                fontWeight: 900,
                letterSpacing: 4,
                color: "#0f766e",
              }}
            >
              YADOKARI
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#475569",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              全国対応・無料で使える
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 48,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 26,
                width: 660,
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 900,
                  lineHeight: 1.12,
                  letterSpacing: 0,
                }}
              >
                住所1つで、民泊の勝ち筋を見つける。
              </div>
              <div
                style={{
                  fontSize: 34,
                  lineHeight: 1.42,
                  color: "#475569",
                  fontWeight: 700,
                }}
              >
                可否判定・届出マップ・収益試算をまとめて確認
              </div>
            </div>
            <div
              style={{
                position: "relative",
                width: 280,
                height: 280,
                borderRadius: 40,
                background: "linear-gradient(135deg, #0f766e 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 22px 60px rgba(13, 148, 136, 0.25)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 48,
                  left: 62,
                  width: 156,
                  height: 110,
                  border: "12px solid white",
                  borderBottom: "none",
                  borderRadius: "86px 86px 0 0",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 60,
                  left: 70,
                  width: 140,
                  height: 96,
                  borderRadius: 18,
                  background: "white",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 88,
                  left: 124,
                  width: 32,
                  height: 68,
                  borderRadius: "16px 16px 0 0",
                  background: "#0f766e",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#64748b",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            <span>住宅宿泊事業・特区民泊・旅館業許可に対応</span>
            <span>yadokari.jp</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
