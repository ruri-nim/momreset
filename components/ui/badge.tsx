import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, style, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 9999,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 700,
        background: "rgb(var(--color-sage) / 0.9)",
        color: "rgb(var(--color-coral))",
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        ...style,
      }}
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-peach px-3 py-1 text-xs font-medium text-ink",
        className,
      )}
      {...props}
    />
  );
}
