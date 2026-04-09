import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OnboardingData } from "@/types/app";

interface OnboardingWeightStepProps {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function normalizeWeightInput(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [integer, ...rest] = cleaned.split(".");

  if (!rest.length) {
    return integer;
  }

  return `${integer}.${rest.join("").slice(0, 1)}`;
}

export default function OnboardingWeightStep({
  data,
  onChange,
  onNext,
  onBack,
}: OnboardingWeightStepProps) {
  const hasRequiredWeightValues = Boolean(
    data.postpartumStartWeightKg && data.currentWeightKg && data.targetWeightKg,
  );

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div className="space-y-6 md:space-y-8" style={{ flex: 1 }}>
        <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Step 4</p>
        <h2 className="text-2xl font-semibold text-white md:text-3xl">체중 정보를 입력해주세요</h2>
        <p className="text-sm leading-6 text-emerald-50/75">
          현재 상태와 목표 흐름을 더 정확히 보기 위해 세 값을 모두 입력해주세요.
        </p>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm text-emerald-100">출산 직후 체중 (kg)</label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="예: 68"
              value={data.postpartumStartWeightKg}
              onChange={(event) =>
                onChange({ postpartumStartWeightKg: normalizeWeightInput(event.target.value) })
              }
              className="border-emerald-800 bg-white text-lg text-slate-950 placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-emerald-100">현재 체중 (kg)</label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="예: 64"
              value={data.currentWeightKg}
              onChange={(event) =>
                onChange({ currentWeightKg: normalizeWeightInput(event.target.value) })
              }
              className="border-emerald-800 bg-white text-lg text-slate-950 placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-emerald-100">목표 체중 (kg)</label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="예: 58"
              value={data.targetWeightKg}
              onChange={(event) =>
                onChange({ targetWeightKg: normalizeWeightInput(event.target.value) })
              }
              className="border-emerald-800 bg-white text-lg text-slate-950 placeholder:text-slate-500"
            />
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
          disabled={!hasRequiredWeightValues}
          className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
