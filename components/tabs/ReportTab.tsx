"use client";

import { useState } from "react";
import ChartBlock from "@/components/common/ChartBlock";
import StatCard from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateBodyScore } from "@/lib/body-score";
import { calculateNutrition } from "@/lib/nutrition";
import { getAppPhase } from "@/lib/phase";
import { generateRecoveryProgressInsight } from "@/lib/recovery-insight";
import { buildRecoveryProgressHistory, getRecoverySignalSnapshot } from "@/lib/recovery";
import type { AppState } from "@/types/app";

interface ReportTabProps {
  state: AppState;
}

const periods = [7, 14, 30] as const;

export default function ReportTab({ state }: ReportTabProps) {
  const [period, setPeriod] = useState<(typeof periods)[number]>(7);
  const nutrition = calculateNutrition(state.meals, state.profile.feedingType);
  const latestCheckIn = state.checkIns[state.checkIns.length - 1];
  const phase = getAppPhase(state.profile.postpartumDay);
  const bodyScore = latestCheckIn ? calculateBodyScore(latestCheckIn, nutrition) : 0;
  const recoverySnapshot = getRecoverySignalSnapshot(state);
  const recoveryProgress = recoverySnapshot.recoveryProgress;
  const recoveryInsight = generateRecoveryProgressInsight(recoverySnapshot);
  const weightTrendData = (
    state.weightLogs.length
      ? state.weightLogs
      : [
          {
            dateKey: "today",
            weightKg: state.profile.currentWeightKg,
          },
        ]
  )
    .slice(-Math.min(period, 14))
    .map((weightLog, index) => ({
      label: `${index + 1}회`,
      value: weightLog.weightKg,
    }));

  const chartData =
    phase === "recovery"
      ? buildRecoveryProgressHistory(state, period)
      : Array.from({ length: Math.min(period, 7) }, (_, index) => ({
          label: `${index + 1}일`,
          value:
            (state.weightLogs[state.weightLogs.length - 1]?.weightKg ??
              state.profile.currentWeightKg) -
            (6 - index) * 0.15,
        }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        {periods.map((value) => (
          <Button
            key={value}
            variant={period === value ? "primary" : "secondary"}
            onClick={() => setPeriod(value)}
          >
            {value}일
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Body Score 흐름" value={`${bodyScore}점`} helper="어제 몸 상태 기준" accent="rose" valueClassName="text-[1.55rem] md:text-[1.68rem]" />
        <StatCard label="Recovery Progress" value={`${recoveryProgress}%`} helper="장기 회복 진행도" accent="sage" valueClassName="text-[1.55rem] md:text-[1.68rem]" />
        <StatCard label="영양 흐름" value={`${nutrition.score}점`} helper="식사 기록 기반 자동 계산" valueClassName="text-[1.55rem] md:text-[1.68rem]" />
        <StatCard
          label="다음 주 포인트"
          value={phase === "recovery" ? "무리 없는 회복" : "안정적 감량"}
          helper="해석과 가이드를 우선으로 보여줘요."
          className="min-h-[186px]"
          valueClassName="korean-balance max-w-[10ch] text-[1rem] leading-[1.3] md:text-[1.06rem]"
          helperClassName="korean-copy max-w-[18ch]"
          labelClassName="max-w-none"
        />
      </div>

      <ChartBlock
        title={phase === "recovery" ? "회복 추이" : "체중 추이"}
        subtitle="숫자 자체보다 흐름과 해석을 보는 리포트예요."
        data={chartData}
      />

      <ChartBlock
        title="몸무게 추이"
        subtitle="기록된 체중 흐름을 함께 보면서 회복과 몸 변화 리듬을 확인해요."
        data={weightTrendData}
      />

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.035em] text-ink">리포트 해석</h3>
        <div className="mt-4 space-y-3 text-[14px] leading-7 text-muted">
          {phase === "recovery" ? (
            <>
              <p className="korean-copy">{recoveryInsight}</p>
              <p className="korean-copy">Body Score는 어제 컨디션을, Recovery Progress는 장기 회복 흐름을 따로 보여줘요.</p>
              <p className="korean-copy">이번 주에는 무리한 운동보다 수면과 영양을 안정적으로 이어가는 쪽이 더 중요해요.</p>
            </>
          ) : (
            <>
              <p className="korean-copy">현재 흐름은 안정적인 편이에요.</p>
              <p className="korean-copy">급한 감량보다 식사와 활동량의 균형을 유지하는 것이 몸 컨디션에 더 좋아요.</p>
              <p className="korean-copy">다음 주에는 단백질과 수분감 있는 식사 비율을 함께 챙겨보세요.</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
