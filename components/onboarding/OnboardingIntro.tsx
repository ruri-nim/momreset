import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingIntroProps {
  onNext: () => void;
}

export default function OnboardingIntro({ onNext }: OnboardingIntroProps) {
  return (
    <div
      className="space-y-8"
      style={{ color: "#ffffff", minHeight: "100%", display: "flex", flexDirection: "column" }}
    >
      <div className="space-y-4" style={{ flex: 1 }}>
        <p
          className="text-sm uppercase tracking-[0.24em] text-emerald-300"
          style={{ color: "#6ee7b7", letterSpacing: "0.24em" }}
        >
          MomReset 소개
        </p>
        <h1
          className="text-4xl font-semibold tracking-tight text-white md:text-5xl"
          style={{ color: "#ffffff", fontSize: "2.25rem", lineHeight: 1.15, fontWeight: 700 }}
        >
          산후 회복부터
          <br />
          체중 리셋까지 관리해요
        </h1>
        <p
          className="max-w-xl text-base leading-7 text-emerald-50/80"
          style={{ color: "rgba(236,253,245,0.8)", maxWidth: 560, fontSize: 16, lineHeight: 1.8 }}
        >
          MomReset은 산후 시기와 몸의 회복 속도를 함께 고려해, 오늘 몸 상태와 전체 회복 흐름을
          차분하게 이해하도록 돕는 웹앱이에요.
        </p>
      </div>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          paddingTop: 16,
          background: "linear-gradient(180deg, rgba(5,9,20,0) 0%, rgba(5,9,20,0.96) 28%)",
        }}
      >
        <Button
          onClick={onNext}
          className="bg-emerald-500 px-6 py-3 text-base text-slate-950 hover:bg-emerald-400"
          style={{ width: "100%" }}
        >
          시작하기
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
