import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        background: "var(--card-background)",
        borderColor: "rgb(var(--color-line) / 0.92)",
        color: "rgb(var(--color-ink))",
        ...style,
      }}
      className={cn(
        "rounded-[24px] border border-line bg-white/90 p-5 shadow-soft backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
