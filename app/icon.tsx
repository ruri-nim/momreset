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
            top: 54,
            left: 62,
            width: 44,
            height: 44,
            borderRadius: 9999,
            border: "6px solid rgba(242, 193, 177, 0.72)",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 72,
            top: 66,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(8deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 10,
              height: 36,
              borderRadius: 9999,
              background: "#ff9e6d",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 36,
              height: 10,
              borderRadius: 9999,
              background: "#ff9e6d",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 10,
              height: 36,
              borderRadius: 9999,
              background: "#ffb37f",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 36,
              height: 10,
              borderRadius: 9999,
              background: "#ffb37f",
              transform: "rotate(45deg)",
            }}
          />
        </div>
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
            gap: 20,
          }}
        >
          <div
            style={{
              width: 176,
              height: 176,
              borderRadius: 70,
              background: "linear-gradient(180deg, #ffe37a 0%, #ffd45f 100%)",
              border: "8px solid #2a1f18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 16px 0 rgba(42, 31, 24, 0.08)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 54,
                left: 48,
                width: 18,
                height: 34,
                borderRadius: 9999,
                background: "#2a1f18",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 54,
                right: 48,
                width: 18,
                height: 34,
                borderRadius: 9999,
                background: "#2a1f18",
              }}
            />
            <div
              style={{
                width: 88,
                height: 44,
                borderBottom: "8px solid #2a1f18",
                borderRadius: "0 0 999px 999px",
                marginTop: 26,
              }}
            />
          </div>
          <div
            style={{
              fontSize: 70,
              fontWeight: 900,
              letterSpacing: "-0.06em",
              textTransform: "uppercase",
              textShadow: "4px 4px 0 rgba(42, 31, 24, 0.08)",
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
