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
    <main className="mx-auto min-h-screen w-full max-w-[460px] px-0 pb-24 pt-0 sm:px-4 sm:pb-28 sm:pt-4">
      <div
        className="relative overflow-hidden rounded-none border-x-0 border-b border-t-0 px-3 pb-6 pt-3 shadow-soft backdrop-blur sm:rounded-[38px] sm:border sm:px-4 sm:pb-8 sm:pt-4"
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
          className="relative mb-4 min-h-[112px] overflow-hidden rounded-[24px] border shadow-soft sm:mb-6 sm:min-h-[128px] sm:rounded-[30px]"
          style={{
            backgroundImage: "url('/dailyok-header-character.png')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            borderColor: "rgba(245, 197, 176, 0.9)",
            boxShadow: "0 14px 28px rgba(188, 129, 94, 0.14)",
          }}
        >
          <div className="absolute inset-y-0 left-0 w-[48%] bg-[linear-gradient(90deg,rgba(255,249,218,0.42),rgba(255,249,218,0.12),transparent)]" />
          <div className="absolute left-[6%] top-1/2 w-[38%] -translate-y-1/2">
            <h1
              className="whitespace-nowrap text-[clamp(25px,7.4vw,34px)] font-black uppercase leading-none text-ink"
              style={{
                fontFamily:
                  '"Chalkboard SE", "Marker Felt", "Trebuchet MS", "Pretendard", sans-serif',
                letterSpacing: "-0.045em",
                textShadow: "2px 3px 0 rgba(113, 84, 63, 0.10)",
              }}
            >
              {title}
            </h1>
          </div>
        </header>

        <div className="relative flex flex-1 flex-col gap-4">{children}</div>
      </div>

      <BottomNav />
    </main>
  );
}
