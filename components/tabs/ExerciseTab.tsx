"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getExerciseRange, getExerciseRecommendation, scoreExerciseMinutes } from "@/lib/exercise";
import type { AppState, ExercisePlanStatus } from "@/types/app";

interface ExerciseTabProps {
  state: AppState;
  onSetTodayExercisePlanStatus: (status: ExercisePlanStatus) => void;
}

function ExerciseSummaryCard({
  label,
  value,
  helper,
  accent = "neutral",
  kind = "metric",
}: {
  label: string;
  value: string;
  helper: ReactNode;
  accent?: "neutral" | "sage" | "rose";
  kind?: "metric" | "title";
}) {
  const background =
    accent === "sage"
      ? "linear-gradient(180deg, rgb(var(--color-sage) / 0.36) 0%, var(--card-background-strong) 100%)"
      : accent === "rose"
        ? "linear-gradient(180deg, rgb(var(--color-peach) / 0.95) 0%, rgb(var(--color-rose) / 0.98) 100%)"
        : "linear-gradient(180deg, var(--card-background-strong) 0%, rgb(var(--color-peach) / 0.92) 100%)";

  return (
    <Card
      className="flex min-h-[142px] flex-col px-4 py-4 md:min-h-[148px] md:px-5 md:py-5"
      style={{ background }}
    >
      <p className="text-[13px] font-medium tracking-[-0.026em]" style={{ color: "var(--text-body)" }}>
        {label}
      </p>
      <div className="mt-3 h-[72px] md:h-[76px]">
        <p
          className={
            kind === "title"
              ? "korean-balance max-w-[10ch] text-[1.02rem] font-semibold leading-[1.28] tracking-[-0.04em] text-ink md:text-[1.08rem]"
              : "korean-balance text-[1.5rem] font-semibold leading-[1.06] tracking-[-0.052em] text-ink md:text-[1.6rem]"
          }
        >
          {value}
        </p>
      </div>
      <p className="mt-2 text-[12.5px] leading-6 tracking-[-0.02em]" style={{ color: "var(--text-soft)" }}>
        {helper}
      </p>
    </Card>
  );
}

export default function ExerciseTab({ state, onSetTodayExercisePlanStatus }: ExerciseTabProps) {
  const latestCheckIn = state.checkIns[state.checkIns.length - 1];
  const recommendation = getExerciseRecommendation({
    postpartumDay: state.profile.postpartumDay,
    deliveryType: state.profile.deliveryType,
    feedingType: state.profile.feedingType,
    latestCheckIn,
  });
  const range = getExerciseRange(state.profile.postpartumDay, state.profile.deliveryType);
  const score = latestCheckIn
    ? scoreExerciseMinutes(latestCheckIn.postpartumDay, latestCheckIn.exerciseMinutes)
    : 0;
  const todayExercisePlanStatus = state.ui.todayExercisePlanStatus;
  const isExercisePlanLocked = Boolean(todayExercisePlanStatus);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ExerciseSummaryCard
          label="오늘 추천 운동"
          value={recommendation.title}
          helper={
            <>
              <span className="block">{recommendation.durationMinutes}분</span>
              <span className="block">{recommendation.intensityLabel}</span>
            </>
          }
          accent="sage"
          kind="title"
        />
        <ExerciseSummaryCard
          label="어제 운동 점수"
          value={`${score}점`}
          helper="많이 하는 것보다 시기에 맞는 정도가 중요해요."
          accent="rose"
        />
        <ExerciseSummaryCard
          label="적정 범위"
          value={`${range.min}-${range.optimal}분`}
          helper={`상한은 ${range.max}분`}
        />
      </div>

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-[1.35rem] font-semibold tracking-[-0.035em] text-ink">오늘의 가이드</h3>
            <p className="mt-2 text-[14px] leading-6 text-muted">{recommendation.tip}</p>
          </div>
          <Badge>{recommendation.stageLabel}</Badge>
        </div>

        <div className="mt-5 rounded-[24px] bg-peach/60 p-5">
          <p className="text-[12px] font-medium tracking-[-0.022em] text-muted">추천 루틴</p>
          <p className="mt-3 text-[1.65rem] font-semibold tracking-[-0.045em] text-ink">{recommendation.title}</p>
          <p className="korean-copy mt-3 text-[14px] leading-7 text-muted">{recommendation.focus}</p>
          <ul className="mt-4 space-y-2 text-[14px] leading-7 text-ink">
            {recommendation.routine.map((item) => (
              <li key={item} className="korean-copy">
                • {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl border border-line/80 bg-white/60 px-4 py-3 text-[13px] leading-6 text-muted">
            {recommendation.exerciseReason}
          </div>
          {recommendation.caution ? (
            <div className="mt-3 rounded-2xl border border-rose bg-rose/40 px-4 py-3 text-[13px] leading-6 text-ink">
              {recommendation.caution}
            </div>
          ) : null}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => onSetTodayExercisePlanStatus("done")}
              disabled={isExercisePlanLocked}
              style={
                todayExercisePlanStatus === "done"
                  ? {
                      boxShadow: "0 0 0 3px rgba(16,185,129,0.16) inset",
                      opacity: 1,
                    }
                  : undefined
              }
            >
              완료했어요
            </Button>
            <Button
              variant="secondary"
              onClick={() => onSetTodayExercisePlanStatus("rest")}
              disabled={isExercisePlanLocked}
              style={
                todayExercisePlanStatus === "rest"
                  ? {
                      backgroundColor: "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(16,185,129,0.36)",
                      color: "#059669",
                      opacity: 1,
                    }
                  : undefined
              }
            >
              오늘은 쉬어갈게요
            </Button>
          </div>
          <div
            className="mt-4 rounded-2xl px-4 py-3 text-[14px] leading-6 text-muted"
            style={{
              background: "rgb(var(--color-peach) / 0.8)",
              border: "1px solid rgb(var(--color-line) / 0.78)",
            }}
          >
            {todayExercisePlanStatus === "done"
              ? "오늘 추천 운동을 했다고 기록해두었어요. 실제 점수는 내일 체크인에 반영돼요."
              : todayExercisePlanStatus === "rest"
                ? "오늘은 쉬어가기로 표시해두었어요. 무리 없는 회복을 우선으로 볼게요."
                : "아직 오늘 운동 계획 선택 전이에요. 아래 버튼으로 간단히 표시해둘 수 있어요."}
          </div>
        </div>
      </Card>

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.035em] text-ink">운동 해석</h3>
        <div className="mt-4 space-y-3 text-[14px] leading-7 text-muted">
          <p className="korean-copy">MomReset은 운동량이 많을수록 높은 점수를 주지 않아요. 시기별 적정 범위를 우선으로 봐요.</p>
          <p className="korean-copy">{recommendation.recoveryNote}</p>
          <p className="korean-copy">
            현재 적정 범위는 {range.min}-{range.optimal}분이고, 상한은 {range.max}분 정도로 보고 있어요.
          </p>
        </div>
      </Card>
    </div>
  );
}
