import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: "var(--card-background)",
        borderColor: "rgb(var(--color-line) / 0.92)",
        color: "rgb(var(--color-ink))",
        boxShadow: "0 12px 28px rgba(164, 116, 85, 0.12)",
        ...style,
      }}
      className={cn(
        "kitsch-card rounded-[28px] border border-line bg-white/90 p-5 shadow-soft backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
