import { ImageResponse } from "next/og";

export const size = {
  width: 1024,
  height: 1024,
};

export const contentType = "image/png";

export default function MobileIcon() {
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
            "linear-gradient(180deg, rgba(191,247,224,1) 0%, rgba(165,236,211,1) 100%)",
          borderRadius: 240,
          position: "relative",
          overflow: "hidden",
          color: "#2a1f18",
          fontFamily: "Trebuchet MS, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 110,
            left: 118,
            width: 86,
            height: 86,
            borderRadius: 9999,
            border: "12px solid rgba(132, 190, 171, 0.72)",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 126,
            top: 118,
            width: 68,
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(8deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 16,
              height: 68,
              borderRadius: 9999,
              background: "#6ab79e",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 68,
              height: 16,
              borderRadius: 9999,
              background: "#6ab79e",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 16,
              height: 68,
              borderRadius: 9999,
              background: "#8fd0ba",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 68,
              height: 16,
              borderRadius: 9999,
              background: "#8fd0ba",
              transform: "rotate(45deg)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            inset: 56,
            borderRadius: 192,
            border: "12px solid rgba(132, 190, 171, 0.95)",
            background:
              "linear-gradient(180deg, rgba(245,255,251,0.98), rgba(234,250,243,0.96))",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 34,
          }}
        >
          <div
            style={{
              width: 352,
              height: 352,
              borderRadius: 136,
              background: "linear-gradient(180deg, #ffe8ad 0%, #ffd692 100%)",
              border: "14px solid #2a1f18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 24px 0 rgba(42, 31, 24, 0.08)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 104,
                left: 68,
                width: 100,
                height: 80,
                borderRadius: 32,
                border: "14px solid #2a1f18",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 104,
                right: 68,
                width: 100,
                height: 80,
                borderRadius: 32,
                border: "14px solid #2a1f18",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 124,
                width: 48,
                height: 12,
                borderRadius: 9999,
                background: "#2a1f18",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 190,
                width: 12,
                height: 54,
                borderRadius: 9999,
                background: "#2a1f18",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 182,
                left: 95,
                width: 16,
                height: 16,
                borderRadius: 9999,
                background: "#2a1f18",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 182,
                right: 95,
                width: 16,
                height: 16,
                borderRadius: 9999,
                background: "#2a1f18",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 232,
                left: 102,
                width: 76,
                height: 34,
                borderBottom: "14px solid #2a1f18",
                borderRadius: "0 0 999px 999px",
                transform: "rotate(8deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 232,
                right: 102,
                width: 76,
                height: 34,
                borderBottom: "14px solid #2a1f18",
                borderRadius: "0 0 999px 999px",
                transform: "rotate(-8deg)",
              }}
            />
            <div
              style={{
                width: 146,
                height: 54,
                borderBottom: "14px solid #2a1f18",
                borderRadius: "0 0 999px 999px",
                marginTop: 152,
              }}
            />
          </div>

          <div
            style={{
              fontSize: 130,
              fontWeight: 900,
              letterSpacing: "-0.06em",
              textTransform: "uppercase",
              color: "#275849",
              textShadow: "8px 8px 0 rgba(39, 88, 73, 0.10)",
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
