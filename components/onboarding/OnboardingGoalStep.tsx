import { Button } from "@/components/ui/button";
import type { OnboardingData } from "@/types/app";

interface OnboardingGoalStepProps {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  hasSelected: boolean;
}

const options: Array<OnboardingData["goalMode"]> = [
  "회복 우선",
  "회복 + 체형 회복",
  "감량까지 함께 관리",
];

export default function OnboardingGoalStep({
  data,
  onChange,
  onNext,
  onBack,
  hasSelected,
}: OnboardingGoalStepProps) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div className="space-y-6 md:space-y-8" style={{ flex: 1 }}>
        <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Step 5</p>
        <h2 className="text-2xl font-semibold text-white md:text-3xl">지금 가장 중요한 목표는 무엇인가요?</h2>
        <p className="text-sm leading-6 text-emerald-50/75">
          이 선택은 회복 우선순위와 안내 톤을 조정하는 데 사용돼요.
        </p>
        </div>

        <div className="grid gap-3">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange({ goalMode: option })}
              className={`rounded-3xl border px-5 py-5 text-left transition ${
                data.goalMode === option
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
