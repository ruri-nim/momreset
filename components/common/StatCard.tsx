"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: ReactNode;
  value: string;
  helper?: ReactNode;
  accent?: "rose" | "sage" | "neutral";
  className?: string;
  valueClassName?: string;
  helperClassName?: string;
  labelClassName?: string;
}

const accentMap = {
  rose: "from-rose/80 to-peach",
  sage: "from-sage to-white",
  neutral: "from-white to-peach/40",
};

export default function StatCard({
  label,
  value,
  helper,
  accent = "neutral",
  className,
  valueClassName,
  helperClassName,
  labelClassName,
}: StatCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card
        className={cn(
          "flex h-full min-h-[142px] flex-col bg-gradient-to-br px-4 py-4 md:min-h-[148px] md:px-5 md:py-5",
          accentMap[accent],
          className,
        )}
        style={{
          background:
            accent === "rose"
              ? "linear-gradient(180deg, rgb(var(--color-peach) / 0.95) 0%, rgb(var(--color-rose) / 0.98) 100%)"
              : accent === "sage"
                ? "linear-gradient(180deg, rgb(var(--color-sage) / 0.38) 0%, var(--card-background-strong) 100%)"
                : "linear-gradient(180deg, var(--card-background-strong) 0%, rgb(var(--color-peach) / 0.92) 100%)",
        }}
      >
        <p
          className={cn(
            "korean-balance text-[13px] font-medium leading-[1.34] tracking-[-0.026em]",
            labelClassName,
          )}
          style={{ color: "var(--text-body)" }}
        >
          {label}
        </p>
        <div className="mt-3 h-[56px] md:h-[60px]">
          <p
            className={cn(
              "text-[1.5rem] font-semibold leading-[1.08] text-ink md:text-[1.6rem]",
              valueClassName,
            )}
            style={{ letterSpacing: "-0.05em" }}
          >
            {value}
          </p>
        </div>
        {helper ? (
          <p className={cn("mt-2 text-[12.5px] leading-6", helperClassName)} style={{ color: "var(--text-soft)" }}>
            {helper}
          </p>
        ) : null}
      </Card>
    </motion.div>
  );
}
