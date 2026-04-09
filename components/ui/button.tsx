import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-coral text-white shadow-soft hover:opacity-95",
  secondary: "bg-white text-ink border border-line hover:bg-peach/70",
  ghost: "bg-transparent text-muted hover:bg-white/70",
};

const fallbackStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: "rgb(var(--color-coral))",
    color: "#08110c",
  },
  secondary: {
    backgroundColor: "var(--card-background-strong)",
    color: "rgb(var(--color-ink))",
    border: "1px solid rgb(var(--color-line) / 0.92)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "rgb(var(--color-muted))",
    border: "1px solid rgb(var(--color-line) / 0.65)",
  },
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  style,
  ...props
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 700,
    transition: "all 0.18s ease",
    letterSpacing: "-0.02em",
  };

  return (
    <button
      type={type}
      style={{
        ...baseStyle,
        ...fallbackStyles[variant],
        ...style,
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
