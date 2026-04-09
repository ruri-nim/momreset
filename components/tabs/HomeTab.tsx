"use client";

import ChartBlock from "@/components/common/ChartBlock";
import StatCard from "@/components/common/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { calculateBodyScore, getBodyScoreInsight } from "@/lib/body-score";
import { calculateNutrition } from "@/lib/nutrition";
import { getAppPhase } from "@/lib/phase";
import {
  buildRecoveryProgressChartData,
  getRecoverySignalSnapshot,
  getRecoveryDistance,
  getWeeklyRecoveryTarget,
} from "@/lib/recovery";
import { generateRecoveryProgressInsight } from "@/lib/recovery-insight";
import type { AppState } from "@/types/app";

interface HomeTabProps {
  state: AppState;
}

export default function HomeTab({ state }: HomeTabProps) {
  const latestCheckIn = state.checkIns[state.checkIns.length - 1];
  const phase = getAppPhase(state.profile.postpartumDay);
  const nutrition = calculateNutrition(state.meals, state.profile.feedingType);
  const bodyScore = latestCheckIn ? calculateBodyScore(latestCheckIn, nutrition) : 0;
  const bodyScoreInsight = latestCheckIn
    ? getBodyScoreInsight(latestCheckIn, nutrition)
    : "어제 체크인을 남기면 점수 이유를 더 정확히 보여드릴게요.";
  const recoverySnapshot = getRecoverySignalSnapshot(state);
  const recoveryProgress = recoverySnapshot.recoveryProgress;
  const recoveryTarget = getWeeklyRecoveryTarget(state.profile.postpartumDay);
  const recoveryDistance = getRecoveryDistance(
    recoveryProgress,
    state.profile.postpartumDay,
  );
  const recoveryData = buildRecoveryProgressChartData(state);
  const recoveryInsight = generateRecoveryProgressInsight(recoverySnapshot);
  const highestLoggedWeight = Math.max(
    state.profile.currentWeightKg,
    ...state.weightLogs.map((weightLog) => weightLog.weightKg),
  );
  const totalWeightGap = Math.max(0.1, highestLoggedWeight - state.profile.targetWeightKg);
  const weightLossProgress = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((highestLoggedWeight - state.profile.currentWeightKg) / totalWeightGap) * 100,
      ),
    ),
  );

  if (phase === "reset") {
    return (
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <StatCard
            label="감량 진행률"
            value={`${weightLossProgress}%`}
            helper="지금은 회복 이후의 리셋 흐름을 보고 있어요."
            accent="rose"
          />
          <StatCard
            label="현재 체중"
            value={`${state.profile.currentWeightKg.toFixed(1)}kg`}
            accent="neutral"
          />
          <StatCard
            label="목표 체중"
            value={`${state.profile.targetWeightKg.toFixed(1)}kg`}
            accent="sage"
          />
        </div>
        <ChartBlock
          title="체중 흐름"
          subtitle="회복 이후에는 빠른 감량보다 안정적인 흐름이 더 중요해요."
          data={state.weightLogs.map((weightLog, index) => ({
            label: `${index + 1}일`,
            value: weightLog.weightKg,
          }))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>산후 {state.profile.postpartumDay}일차</Badge>
        <Badge>{state.profile.deliveryType === "c-section" ? "제왕절개" : "자연분만"}</Badge>
        <Badge>{state.profile.feedingType === "breastfeeding" ? "모유수유" : state.profile.feedingType === "mixed" ? "혼합수유" : "분유수유"}</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="오늘의 Body Score" value={`${bodyScore} / 100`} helper={bodyScoreInsight} accent="rose" />
        <StatCard label="Recovery Progress" value={`${recoveryProgress}%`} helper="장기 회복 흐름을 따로 보여줘요." accent="sage" />
        <StatCard label="이번 주 목표선" value={`${recoveryTarget}%`} helper="주차별 회복 목표 기준이에요." />
        <StatCard label="목표까지 거리" value={`${recoveryDistance}%`} helper="조급함보다 안정적인 회복이 우선이에요." />
      </div>

      <ChartBlock
        title="Recovery Progress"
        subtitle="Body Score와 별개로, 산후 6주 회복 흐름을 보여줘요."
        data={recoveryData}
      />

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.035em] text-ink">회복 해석</h3>
        <p className="korean-copy mt-3 text-[14px] leading-7 text-muted">{recoveryInsight}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-peach/60 p-4">
            <p className="text-[12px] font-medium tracking-[-0.022em] text-muted">기본 회복 시계</p>
            <p className="mt-3 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink">{recoverySnapshot.baseline}%</p>
          </div>
          <div className="rounded-2xl bg-peach/60 p-4">
            <p className="text-[12px] font-medium tracking-[-0.022em] text-muted">최근 회복 조정</p>
            <p className="mt-3 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink">
              {recoverySnapshot.adjustment >= 0 ? "+" : ""}
              {recoverySnapshot.adjustment}
            </p>
          </div>
          <div className="rounded-2xl bg-peach/60 p-4">
            <p className="text-[12px] font-medium tracking-[-0.022em] text-muted">기록 완성도</p>
            <p className="mt-3 text-[1.7rem] font-semibold tracking-[-0.04em] text-ink">
              {recoverySnapshot.loggingCompleteness}%
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="수면" value={`${latestCheckIn?.sleepHours ?? 0}시간`} helper="어제 기준" />
        <StatCard label="수분" value={`${latestCheckIn?.hydrationLiters ?? 0}L`} helper="어제 기준" />
        <StatCard label="통증" value={`${latestCheckIn?.painLevel ?? 0} / 10`} helper="낮을수록 좋아요" />
      </div>

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.035em] text-ink">영양 요약</h3>
        <p className="korean-copy mt-2 text-[14px] leading-6 text-muted">식사 기록을 바탕으로 자동 계산된 결과예요.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="flex min-h-[142px] flex-col rounded-2xl bg-peach/60 p-4">
            <p className="text-[12px] font-medium tracking-[-0.022em] text-muted">영양 점수</p>
            <div className="mt-4 min-h-[58px]">
              <p className="text-[1.45rem] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">{nutrition.score}점</p>
            </div>
          </div>
          <div className="flex min-h-[142px] flex-col rounded-2xl bg-peach/60 p-4">
            <p className="text-[12px] font-medium tracking-[-0.022em] text-muted">
              <span className="block">섭취량</span>
              <span className="block">적정도</span>
            </p>
            <div className="mt-4 min-h-[58px]">
              <p className="text-[1.45rem] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">{nutrition.calorieAdequacy}%</p>
            </div>
          </div>
          <div className="flex min-h-[142px] flex-col rounded-2xl bg-peach/60 p-4">
            <p className="text-[12px] font-medium tracking-[-0.022em] text-muted">
              <span className="block">단백질</span>
              <span className="block">적정도</span>
            </p>
            <div className="mt-4 min-h-[58px]">
              <p className="text-[1.45rem] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">{nutrition.proteinAdequacy}%</p>
            </div>
          </div>
          <div className="flex min-h-[142px] flex-col rounded-2xl bg-peach/60 p-4">
            <p className="text-[12px] font-medium tracking-[-0.022em] text-muted">
              <span className="block">기록</span>
              <span className="block">완성도</span>
            </p>
            <div className="mt-4 min-h-[58px]">
              <p className="text-[1.45rem] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">{nutrition.completeness}%</p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {nutrition.alerts.length ? (
            nutrition.alerts.map((alert) => (
              <div key={alert} className="rounded-2xl border border-rose bg-rose/40 px-4 py-3 text-sm text-ink">
                {alert}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-sage bg-sage/40 px-4 py-3 text-sm text-ink">
              현재 식사 흐름은 비교적 안정적이에요.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
