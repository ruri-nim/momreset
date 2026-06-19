import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(180deg, rgba(255,249,184,1) 0%, rgba(255,245,191,1) 100%)",
          borderRadius: 42,
          position: "relative",
          overflow: "hidden",
          color: "#2a1f18",
          fontFamily: "Trebuchet MS, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: 34,
            border: "4px solid rgba(242, 193, 177, 0.95)",
            background:
              "linear-gradient(180deg, rgba(255,252,242,0.98), rgba(255,247,233,0.96))",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 9999,
              background: "#ffd666",
              border: "4px solid #2a1f18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderBottom: "4px solid #2a1f18",
                borderRadius: "0 0 999px 999px",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: "-0.06em",
              textTransform: "uppercase",
            }}
          >
            OK
          </div>
        </div>
      </div>
    ),
    size,
  );
}
