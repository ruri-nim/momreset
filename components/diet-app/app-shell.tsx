import type { ReactNode } from "react";
import { BottomNav } from "@/components/diet-app/bottom-nav";

interface AppShellProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  embedded?: boolean;
}

export function AppShell({
  children,
  eyebrow,
  title,
  description,
  embedded = false,
}: AppShellProps) {
  if (embedded) {
    return (
      <main className="w-full bg-transparent px-1 pb-6">
        <div className="flex flex-col gap-4">{children}</div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[460px] px-4 pb-28 pt-4">
      <div
        className="relative overflow-hidden rounded-[38px] border px-4 pb-8 pt-4 shadow-soft backdrop-blur"
        style={{
          background: "var(--shell-background)",
          borderColor: "var(--shell-border)",
          boxShadow: "0 18px 40px rgba(163, 120, 89, 0.16)",
        }}
      >
        <div className="kitsch-doodle left-4 top-6 text-[24px]">☁️</div>
        <div className="kitsch-doodle right-7 top-5 text-[22px] rotate-[8deg]">🌙</div>
        <div className="kitsch-doodle left-[18%] top-[112px] text-[18px] -rotate-[12deg]">⭐</div>
        <div className="kitsch-doodle right-[14%] top-[128px] text-[20px] rotate-[10deg]">💌</div>
        <div className="kitsch-doodle right-10 bottom-28 text-[22px]">🛸</div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(255,205,96,0.18),transparent_60%)]" />

        <header
          className="relative mb-6 rounded-[30px] border p-5 shadow-soft backdrop-blur"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,252,241,0.97) 0%, rgba(255,246,225,0.96) 100%)",
            borderColor: "rgba(245, 197, 176, 0.9)",
            boxShadow: "0 14px 28px rgba(188, 129, 94, 0.14)",
          }}
        >
          <div className="kitsch-doodle right-4 top-4 text-[16px]">✨</div>
          <div className="kitsch-doodle left-5 bottom-3 text-[16px] -rotate-[14deg]">🍊</div>
          <h1 className="kitsch-title max-w-[12ch] text-[34px] text-[#fffaf0] sm:text-[38px]">
            {title}
          </h1>
        </header>

        <div className="relative flex flex-1 flex-col gap-4">{children}</div>
      </div>

      <BottomNav />
    </main>
  );
}
