import type { SmileLevel } from "@/types/diet-app";

const smileMap: Record<
  SmileLevel,
  { emoji: string; label: string; background: string; color: string; border: string }
> = {
  very_happy: {
    emoji: "😎",
    label: "아주 잘함",
    background: "linear-gradient(135deg,#fff7b8,#ffe066)",
    color: "#6b5200",
    border: "rgba(255,204,77,0.7)",
  },
  happy: {
    emoji: "☺️",
    label: "잘함",
    background: "linear-gradient(135deg,#fff1a8,#ffd166)",
    color: "#6a4700",
    border: "rgba(255,186,73,0.72)",
  },
  neutral: {
    emoji: "🙄",
    label: "보통",
    background: "linear-gradient(135deg,#ffe0b2,#ffb88c)",
    color: "#74411d",
    border: "rgba(244,144,99,0.65)",
  },
  sad: {
    emoji: "☹️",
    label: "아쉬움",
    background: "linear-gradient(135deg,#ffb4a2,#ff8a80)",
    color: "#7a1f12",
    border: "rgba(236,90,73,0.66)",
  },
  very_sad: {
    emoji: "😭",
    label: "실패",
    background: "linear-gradient(135deg,#ff8a80,#ff5252)",
    color: "#6f0f12",
    border: "rgba(214,55,55,0.72)",
  },
};

interface SmileChipProps {
  level: SmileLevel;
  compact?: boolean;
}

export function SmileChip({ level, compact = false }: SmileChipProps) {
  const item = smileMap[level];

  return (
    <div
      style={{
        background: item.background,
        color: item.color,
        border: `1px solid ${item.border}`,
      }}
      className={
        compact
          ? "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
          : "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold"
      }
    >
      <span>{item.emoji}</span>
      <span>{item.label}</span>
    </div>
  );
}
