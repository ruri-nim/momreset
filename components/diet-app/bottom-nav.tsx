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
      className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-28px)] max-w-[430px] -translate-x-1/2 items-center justify-between rounded-[28px] border px-3 py-2 shadow-soft backdrop-blur"
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
              "flex min-w-[68px] flex-col items-center gap-1 rounded-[18px] px-3 py-2 text-[11px] font-extrabold text-muted transition",
              isActive && "text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.75)]",
            )}
            style={isActive ? { background: "var(--nav-active)" } : undefined}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
