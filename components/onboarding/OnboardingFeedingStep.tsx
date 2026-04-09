import { Button } from "@/components/ui/button";
import type { OnboardingData } from "@/types/app";

interface OnboardingFeedingStepProps {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  hasSelected: boolean;
}

export default function OnboardingFeedingStep({
  data,
  onChange,
  onNext,
  onBack,
  hasSelected,
}: OnboardingFeedingStepProps) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div className="space-y-6 md:space-y-8" style={{ flex: 1 }}>
        <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Step 3</p>
        <h2 className="text-2xl font-semibold text-white md:text-3xl">현재 수유 형태를 알려주세요</h2>
        <p className="text-sm leading-6 text-emerald-50/75">
          수유는 보너스가 아니라 회복 부담을 반영하는 기준으로 사용돼요.
        </p>
        </div>

        <div className="grid gap-3">
          {(["모유", "혼합", "분유"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange({ feedingType: option })}
              className={`rounded-3xl border px-5 py-5 text-left transition ${
                data.feedingType === option
                  ? "border-emerald-400 bg-emerald-500/15 text-white"
                  : "border-emerald-900 bg-slate-950/50 text-emerald-50/80"
              }`}
            >
              <p className="text-lg font-medium">{option}</p>
            </button>
          ))}
        </div>
      </div>

      <div
        className="flex flex-col gap-3 sm:flex-row"
        style={{
          position: "sticky",
          bottom: 0,
          paddingTop: 16,
          marginTop: 16,
          background: "linear-gradient(180deg, rgba(5,9,20,0) 0%, rgba(5,9,20,0.96) 28%)",
        }}
      >
        <Button variant="ghost" onClick={onBack} className="text-emerald-100 hover:bg-white/10">
          이전
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasSelected}
          className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
