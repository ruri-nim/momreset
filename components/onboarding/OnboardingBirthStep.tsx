import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OnboardingData } from "@/types/app";

interface OnboardingBirthStepProps {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingBirthStep({
  data,
  onChange,
  onNext,
  onBack,
}: OnboardingBirthStepProps) {
  const canContinue = Boolean(data.birthDate);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div className="space-y-6 md:space-y-8" style={{ flex: 1 }}>
        <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Step 2</p>
        <h2 className="text-2xl font-semibold text-white md:text-3xl">출산 정보를 알려주세요</h2>
        <p className="text-sm leading-6 text-emerald-50/75">
          산후 일차와 회복 단계를 계산하는 데 필요한 기본 정보예요.
        </p>
        </div>

        <div className="space-y-4 md:space-y-5">
          <div>
            <label className="mb-2 block text-sm text-emerald-100">출산일</label>
            <Input
              type="date"
              value={data.birthDate}
              onChange={(event) => onChange({ birthDate: event.target.value })}
              className="border-emerald-800 bg-white text-slate-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-emerald-100">분만 방식</label>
            <div className="grid gap-3 md:grid-cols-2">
              {(["자연분만", "제왕절개"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange({ deliveryType: option })}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    data.deliveryType === option
                      ? "border-emerald-400 bg-emerald-500/15 text-white"
                      : "border-emerald-900 bg-slate-950/50 text-emerald-50/80"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
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
          disabled={!canContinue}
          className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
