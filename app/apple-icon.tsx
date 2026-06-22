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
            top: 18,
            left: 18,
            width: 16,
            height: 16,
            borderRadius: 9999,
            border: "3px solid rgba(242, 193, 177, 0.72)",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 20,
            top: 18,
            width: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(8deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 4,
              height: 16,
              borderRadius: 9999,
              background: "#ff9e6d",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 16,
              height: 4,
              borderRadius: 9999,
              background: "#ff9e6d",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 4,
              height: 16,
              borderRadius: 9999,
              background: "#ffb37f",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 16,
              height: 4,
              borderRadius: 9999,
              background: "#ffb37f",
              transform: "rotate(45deg)",
            }}
          />
        </div>
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
              width: 62,
              height: 62,
              borderRadius: 24,
              background: "linear-gradient(180deg, #ffe37a 0%, #ffd45f 100%)",
              border: "4px solid #2a1f18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 0 rgba(42, 31, 24, 0.08)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 18,
                left: 16,
                width: 6,
                height: 12,
                borderRadius: 9999,
                background: "#2a1f18",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 18,
                right: 16,
                width: 6,
                height: 12,
                borderRadius: 9999,
                background: "#2a1f18",
              }}
            />
            <div
              style={{
                width: 28,
                height: 16,
                borderBottom: "4px solid #2a1f18",
                borderRadius: "0 0 999px 999px",
                marginTop: 8,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: "-0.06em",
              textTransform: "uppercase",
              textShadow: "2px 2px 0 rgba(42, 31, 24, 0.08)",
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
