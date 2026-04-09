"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AbdominalPressureBucket,
  BleedingBucket,
  ExerciseBucket,
  FeedingBucket,
  HydrationBucket,
  NutritionBucket,
  PainBucket,
  PelvicFloorDiscomfortBucket,
  ScarDiscomfortBucket,
  SleepBucket,
} from "@/types/app";

const fieldOptions = {
  sleep: ["4h 이하", "4-6h", "6-8h", "8h+"] as const,
  hydration: ["3컵 이하", "4-5컵", "6-7컵", "8컵+"] as const,
  pain: ["0-3", "4-6", "7-10"] as const,
  bleeding: ["없음", "적음", "보통", "많음"] as const,
  exercise: ["없음", "10분", "20분+", "30분+"] as const,
  nutrition: ["부족", "보통", "충분"] as const,
  feeding: ["모유", "혼합", "분유"] as const,
  scarDiscomfort: ["없음", "약간", "뚜렷함"] as const,
  abdominalPressure: ["없음", "약간", "뚜렷함"] as const,
  pelvicFloorDiscomfort: ["없음", "약간", "뚜렷함"] as const,
};

export interface DailyRecoveryFormState {
  sleep: SleepBucket;
  hydration: HydrationBucket;
  pain: PainBucket;
  bleeding: BleedingBucket;
  exercise: ExerciseBucket;
  nutrition: NutritionBucket;
  feeding: FeedingBucket;
  scarDiscomfort: ScarDiscomfortBucket;
  abdominalPressure: AbdominalPressureBucket;
  pelvicFloorDiscomfort: PelvicFloorDiscomfortBucket;
  weightKg: string;
}

interface DailyRecoveryCheckinModalProps {
  open: boolean;
  value: DailyRecoveryFormState;
  onChange: (next: DailyRecoveryFormState) => void;
  onSave: () => void;
  onLater: () => void;
}

function OptionRow<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onSelect: (next: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-emerald-100">{label}</p>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`min-h-[48px] rounded-2xl border px-3 py-2 text-sm transition ${
              option === value
                ? "border-emerald-400 bg-emerald-500/15 text-white"
                : "border-emerald-900 bg-slate-950/40 text-emerald-50/80"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DailyRecoveryCheckinModal({
  open,
  value,
  onChange,
  onSave,
  onLater,
}: DailyRecoveryCheckinModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onLater}
      title="어제의 기록을 남겨주세요"
      description="30초면 충분해요"
      className="max-w-3xl border border-emerald-950 text-white"
      panelStyle={{
        background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(17,24,39,0.99) 100%)",
        color: "#ffffff",
      }}
    >
      <div className="space-y-5">
        <OptionRow
          label="수면"
          options={fieldOptions.sleep}
          value={value.sleep}
          onSelect={(sleep) => onChange({ ...value, sleep })}
        />
        <OptionRow
          label="수분"
          options={fieldOptions.hydration}
          value={value.hydration}
          onSelect={(hydration) => onChange({ ...value, hydration })}
        />
        <OptionRow
          label="통증"
          options={fieldOptions.pain}
          value={value.pain}
          onSelect={(pain) => onChange({ ...value, pain })}
        />
        <OptionRow
          label="출혈"
          options={fieldOptions.bleeding}
          value={value.bleeding}
          onSelect={(bleeding) => onChange({ ...value, bleeding })}
        />
        <OptionRow
          label="운동"
          options={fieldOptions.exercise}
          value={value.exercise}
          onSelect={(exercise) => onChange({ ...value, exercise })}
        />
        <OptionRow
          label="영양 느낌"
          options={fieldOptions.nutrition}
          value={value.nutrition}
          onSelect={(nutrition) => onChange({ ...value, nutrition })}
        />
        <OptionRow
          label="수유"
          options={fieldOptions.feeding}
          value={value.feeding}
          onSelect={(feeding) => onChange({ ...value, feeding })}
        />
        <OptionRow
          label="상처/절개부 불편감"
          options={fieldOptions.scarDiscomfort}
          value={value.scarDiscomfort}
          onSelect={(scarDiscomfort) => onChange({ ...value, scarDiscomfort })}
        />
        <OptionRow
          label="복부 당김/복압 불편감"
          options={fieldOptions.abdominalPressure}
          value={value.abdominalPressure}
          onSelect={(abdominalPressure) => onChange({ ...value, abdominalPressure })}
        />
        <OptionRow
          label="골반저 불편감"
          options={fieldOptions.pelvicFloorDiscomfort}
          value={value.pelvicFloorDiscomfort}
          onSelect={(pelvicFloorDiscomfort) => onChange({ ...value, pelvicFloorDiscomfort })}
        />
        <div>
          <p className="mb-2 text-sm text-emerald-100">어제 체중 (선택)</p>
          <Input
            type="text"
            inputMode="decimal"
            value={value.weightKg}
            onChange={(event) => onChange({ ...value, weightKg: event.target.value.replace(/[^0-9.]/g, "") })}
            placeholder="예: 63.8"
            className="border-emerald-800 bg-slate-950/70 text-white placeholder:text-slate-500"
          />
        </div>

        <div
          className="flex flex-col gap-3 pt-3 sm:flex-row"
          style={{
            position: "sticky",
            bottom: -6,
            paddingBottom: 8,
            marginTop: 4,
            background:
              "linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.98) 26%)",
          }}
        >
          <Button
            variant="secondary"
            onClick={onLater}
            className="w-full border-emerald-800 bg-white/5 text-white hover:bg-white/10"
          >
            나중에 입력
          </Button>
          <Button
            onClick={onSave}
            className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          >
            저장
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
