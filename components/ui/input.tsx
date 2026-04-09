import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, style, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{
        width: "100%",
        borderRadius: 24,
        border: "1px solid rgb(var(--color-line) / 0.92)",
        backgroundColor: "var(--card-background-strong)",
        color: "rgb(var(--color-ink))",
        padding: "14px 18px",
        fontSize: 16,
        outline: "none",
        letterSpacing: "-0.02em",
        ...style,
      }}
      className={cn(
        "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-coral",
        className,
      )}
      {...props}
    />
  );
}
