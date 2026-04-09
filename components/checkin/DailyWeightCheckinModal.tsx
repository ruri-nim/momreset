"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface DailyWeightCheckinModalProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onLater: () => void;
}

export default function DailyWeightCheckinModal({
  open,
  value,
  onChange,
  onSave,
  onLater,
}: DailyWeightCheckinModalProps) {
  const canSave = useMemo(() => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0;
  }, [value]);

  return (
    <Dialog
      open={open}
      onClose={onLater}
      title="어제 체중 기록"
      description="가볍게 숫자 하나만 남기면 돼요"
      className="max-w-lg border border-emerald-950 text-white"
      panelStyle={{
        background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(17,24,39,0.99) 100%)",
        color: "#ffffff",
      }}
    >
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm text-emerald-100">체중 (kg)</label>
          <Input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(event) => onChange(event.target.value)}
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
            disabled={!canSave}
            className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            저장
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
