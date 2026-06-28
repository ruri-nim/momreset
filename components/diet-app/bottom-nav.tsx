"use client";

import { usePathname } from "next/navigation";
import { Dumbbell, Home, ListChecks, PieChart, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/food", label: "Food", icon: Utensils },
  { href: "/exercise", label: "Exercise", icon: Dumbbell },
  { href: "/rules", label: "Rules", icon: ListChecks },
  { href: "/report", label: "My Progress", icon: PieChart },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-2 left-1/2 z-20 flex w-[calc(100%-16px)] max-w-[430px] -translate-x-1/2 items-center justify-between rounded-[24px] border px-1.5 py-1.5 shadow-soft backdrop-blur sm:bottom-4 sm:w-[calc(100%-28px)] sm:rounded-[28px] sm:px-3 sm:py-2"
      style={{
        background: "var(--nav-background)",
        borderColor: "rgba(245, 197, 176, 0.9)",
        boxShadow: "0 12px 24px rgba(187, 130, 92, 0.16)",
      }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => {
              if (isActive) {
                return;
              }

              window.location.assign(item.href);
            }}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[16px] px-1 py-2 text-[10px] font-extrabold text-muted transition sm:min-w-[68px] sm:rounded-[18px] sm:px-3 sm:text-[11px]",
              isActive && "text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75)]",
            )}
            style={isActive ? { background: "var(--nav-active)" } : undefined}
          >
            <Icon className="h-4 w-4" />
            <span className="whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
