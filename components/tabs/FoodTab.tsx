"use client";

import { useMemo, useState } from "react";
import FoodSearchDialog from "@/components/food/FoodSearchDialog";
import StatCard from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateNutrition } from "@/lib/nutrition";
import type { AppState } from "@/types/app";
import type { MealRecord } from "@/types/food";

interface FoodTabProps {
  state: AppState;
  onAddMeal: (meal: MealRecord) => void;
}

export default function FoodTab({ state, onAddMeal }: FoodTabProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const nutrition = useMemo(
    () => calculateNutrition(state.meals, state.profile.feedingType),
    [state.meals, state.profile.feedingType],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="영양 점수"
          value={`${nutrition.score}점`}
          accent="rose"
          valueClassName="whitespace-nowrap text-[1.45rem]"
          labelClassName="max-w-none"
        />
        <StatCard
          label={
            <>
              <span className="block">섭취량</span>
              <span className="block">적정도</span>
            </>
          }
          value={`${nutrition.calorieAdequacy}%`}
          accent="neutral"
          valueClassName="whitespace-nowrap text-[1.45rem]"
          labelClassName="max-w-none"
        />
        <StatCard
          label={
            <>
              <span className="block">단백질</span>
              <span className="block">적정도</span>
            </>
          }
          value={`${nutrition.proteinAdequacy}%`}
          accent="sage"
          valueClassName="whitespace-nowrap text-[1.45rem]"
          labelClassName="max-w-none"
        />
        <StatCard
          label={
            <>
              <span className="block">수분감 있는</span>
              <span className="block">식사</span>
            </>
          }
          value={`${nutrition.hydrationMealRatio}%`}
          accent="neutral"
          valueClassName="whitespace-nowrap text-[1.45rem]"
          labelClassName="max-w-none"
        />
      </div>

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-[1.35rem] font-semibold tracking-[-0.035em] text-ink">식사 기록</h3>
            <p className="korean-copy mt-2 text-[14px] leading-6 text-muted">음식 이름을 검색해서 빠르게 기록하고, 영양 계산에 바로 반영해요.</p>
          </div>
          <Button onClick={() => setSearchOpen(true)} className="min-w-[120px] px-6 py-3 text-[15px]">
            검색
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {state.meals.map((meal) => (
            <div
              key={meal.id}
              className="rounded-2xl border px-4 py-4"
              style={{
                borderColor: "rgb(var(--color-line) / 0.84)",
                background: "rgb(var(--color-peach) / 0.8)",
              }}
            >
              <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[15px] font-semibold tracking-[-0.025em] text-ink">{meal.name}</p>
                  <p className="korean-copy mt-1 text-[14px] leading-6 text-muted">
                    {meal.category} · {meal.calories} kcal · {meal.protein}g 단백질 · {meal.portionMultiplier}배
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-muted">
                    {meal.carbs !== undefined ? `탄수화물 ${meal.carbs}g · ` : ""}
                    {meal.fat !== undefined ? `지방 ${meal.fat}g · ` : ""}
                    기준 {meal.servingSize ?? "1회분"}
                  </p>
                </div>
                <span className="text-xs text-muted">{meal.source === "search" ? "검색 기록" : "사진 기록"}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="px-4 py-5 md:px-5 md:py-6">
        <h3 className="text-[1.35rem] font-semibold tracking-[-0.035em] text-ink">영양 알림</h3>
        <div className="mt-4 space-y-2">
          {nutrition.alerts.length ? (
            nutrition.alerts.map((alert) => (
              <div key={alert} className="rounded-2xl bg-peach/70 px-4 py-3 text-sm text-ink">
                {alert}
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-sage/60 px-4 py-3 text-sm text-ink">
              지금 기록 흐름으로 보면 식사 밸런스가 비교적 안정적이에요.
            </div>
          )}
        </div>
      </Card>

      <FoodSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onAddMeal={onAddMeal} />
    </div>
  );
}
