import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 120,
          position: "relative",
          overflow: "hidden",
          color: "#2a1f18",
          fontFamily: "Trebuchet MS, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 96,
            border: "8px solid rgba(242, 193, 177, 0.95)",
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
            gap: 18,
          }}
        >
          <div
            style={{
              width: 148,
              height: 148,
              borderRadius: 9999,
              background: "#ffd666",
              border: "8px solid #2a1f18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 12px 0 rgba(42, 31, 24, 0.08)",
            }}
          >
            <div
              style={{
                width: 78,
                height: 78,
                borderBottom: "8px solid #2a1f18",
                borderRadius: "0 0 999px 999px",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 74,
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
