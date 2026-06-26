"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/common/StatCard";
import FoodSearchDialog from "@/components/food/FoodSearchDialog";
import { AppShell } from "@/components/diet-app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { calculateDailyTargetCalories, DEFAULT_DAILY_TARGET_CALORIES } from "@/lib/diet-app-calorie-target";
import { getDateKeyDaysAgo, getLocalDateKey } from "@/lib/diet-app-date";
import {
  DAILYOK_LOCAL_EVENT,
  loadBodyWeightKg,
  loadFoodList,
  loadOnboardingProfile,
  saveFoodList,
} from "@/lib/diet-app-storage";
import type { DietFoodItem } from "@/types/diet-app";
import type { MealRecord } from "@/types/food";

type MealSection = "아침" | "점심" | "저녁" | "간식";

const mealSections: MealSection[] = ["아침", "점심", "저녁", "간식"];

function getSectionFromMealType(mealType: string): MealSection {
  if (mealType === "breakfast") return "아침";
  if (mealType === "lunch") return "점심";
  if (mealType === "dinner") return "저녁";
  return "간식";
}

function formatFoodMeta(portionMultiplier?: number, consumedGrams?: number) {
  const meta: string[] = [];

  if (portionMultiplier && portionMultiplier !== 1) {
    meta.push(`${portionMultiplier}배`);
  }

  if (consumedGrams) {
    meta.push(`${consumedGrams}g`);
  }

  return meta.join(" · ");
}

function buildFoodNote(item: {
  mealSection: MealSection;
  source?: "manual" | "search";
  portionMultiplier?: number;
  consumedGrams?: number;
}) {
  const sourceLabel = item.source === "search" ? "검색 결과" : "직접 입력";
  const meta = formatFoodMeta(item.portionMultiplier, item.consumedGrams);

  return [item.mealSection, sourceLabel, meta].filter(Boolean).join(" · ");
}

export default function FoodPage() {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [portionMultiplier, setPortionMultiplier] = useState("1");
  const [consumedGrams, setConsumedGrams] = useState("");
  const [manualMealSection, setManualMealSection] = useState<MealSection>("간식");
  const [foodList, setFoodList] = useState<DietFoodItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingCalories, setEditingCalories] = useState("");
  const [editingPortionMultiplier, setEditingPortionMultiplier] = useState("1");
  const [editingConsumedGrams, setEditingConsumedGrams] = useState("");
  const [editingMealSection, setEditingMealSection] = useState<MealSection>("간식");
  const [editingLoggedAt, setEditingLoggedAt] = useState(getLocalDateKey());
  const [dailyTargetCalories, setDailyTargetCalories] = useState(DEFAULT_DAILY_TARGET_CALORIES);

  useEffect(() => {
    const loadData = () => {
      const profile = loadOnboardingProfile();
      const currentWeightKg = loadBodyWeightKg();
      setFoodList(loadFoodList());
      setDailyTargetCalories(calculateDailyTargetCalories(currentWeightKg, profile));
    };

    loadData();
    window.addEventListener(DAILYOK_LOCAL_EVENT, loadData);

    return () => {
      window.removeEventListener(DAILYOK_LOCAL_EVENT, loadData);
    };
  }, []);

  const updateFoodList = (
    updater: DietFoodItem[] | ((prev: DietFoodItem[]) => DietFoodItem[]),
  ) => {
    setFoodList((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveFoodList(next);
      return next;
    });
  };

  const todayKey = getLocalDateKey();
  const yesterdayKey = getDateKeyDaysAgo(1);
  const todayFoodList = foodList.filter((item) => item.loggedAt === todayKey);
  const yesterdayFoodList = foodList.filter((item) => item.loggedAt === yesterdayKey);
  const totalCalories = todayFoodList.reduce((sum, item) => sum + item.calories, 0);
  const targetPercent = Math.min(
    100,
    Math.round((totalCalories / dailyTargetCalories) * 100),
  );
  const recordedSections = mealSections.filter((section) =>
    todayFoodList.some((item) => item.mealSection === section),
  );
  const groupedFoods = mealSections.map((section) => ({
    section,
    items: todayFoodList.filter((item) => item.mealSection === section),
    total: todayFoodList
      .filter((item) => item.mealSection === section)
      .reduce((sum, item) => sum + item.calories, 0),
  }));
  const yesterdayGroupedFoods = mealSections
    .filter((section) => section !== "간식")
    .map((section) => ({
      section,
      items: yesterdayFoodList.filter((item) => item.mealSection === section),
    }));

  const handleSave = () => {
    if (!foodName || !calories) {
      alert("음식 이름과 칼로리를 모두 입력해주세요.");
      return false;
    }

    const newFood: DietFoodItem = {
      id: crypto.randomUUID(),
      name: foodName,
      calories: Number(calories),
      mealSection: manualMealSection,
      loggedAt: todayKey,
      portionMultiplier: Number(portionMultiplier) || 1,
      consumedGrams: consumedGrams ? Number(consumedGrams) : undefined,
      source: "manual",
      note: buildFoodNote({
        mealSection: manualMealSection,
        source: "manual",
        portionMultiplier: Number(portionMultiplier) || 1,
        consumedGrams: consumedGrams ? Number(consumedGrams) : undefined,
      }),
    };

    updateFoodList((prev) => [newFood, ...prev]);
    setFoodName("");
    setCalories("");
    setPortionMultiplier("1");
    setConsumedGrams("");
    setManualMealSection("간식");
    return true;
  };

  const handleAddMealFromSearch = (meal: MealRecord) => {
    const adjustedCalories = Math.round(meal.calories * meal.portionMultiplier);

    const nextFood: DietFoodItem = {
      id: meal.id,
      name: meal.name,
      calories: adjustedCalories,
      mealSection: meal.category,
      loggedAt: meal.loggedAt.slice(0, 10),
      portionMultiplier: meal.portionMultiplier,
      consumedGrams: meal.consumedGrams,
      source: "search",
      note: buildFoodNote({
        mealSection: meal.category,
        source: "search",
        portionMultiplier: meal.portionMultiplier,
        consumedGrams: meal.consumedGrams,
      }),
    };

    updateFoodList((prev) => [nextFood, ...prev]);
  };

  const handleDeleteFood = (id: string) => {
    updateFoodList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRepeatYesterdayMeal = (section: MealSection) => {
    const sectionFoods = yesterdayFoodList.filter((item) => item.mealSection === section);

    if (!sectionFoods.length) {
      return;
    }

    const alreadyHasSimilarSet = sectionFoods.some((item) =>
      todayFoodList.some(
        (todayItem) =>
          todayItem.mealSection === section &&
          todayItem.name === item.name &&
          todayItem.calories === item.calories,
      ),
    );

    if (alreadyHasSimilarSet) {
      const shouldContinue = window.confirm(
        `오늘 ${section}에 비슷한 음식이 이미 있어요. 그래도 한 번 더 추가할까요?`,
      );

      if (!shouldContinue) {
        return;
      }
    }

    const copiedFoods = sectionFoods.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      loggedAt: todayKey,
      note: buildFoodNote({
        mealSection: section,
        source: item.source ?? "manual",
        portionMultiplier: item.portionMultiplier,
        consumedGrams: item.consumedGrams,
      }),
    }));

    updateFoodList((prev) => [...copiedFoods, ...prev]);
  };

  const handleStartEdit = (food: DietFoodItem) => {
    setEditingFoodId(food.id);
    setEditingName(food.name);
    setEditingCalories(String(food.calories));
    setEditingPortionMultiplier(String(food.portionMultiplier ?? 1));
    setEditingConsumedGrams(food.consumedGrams ? String(food.consumedGrams) : "");
    setEditingMealSection(food.mealSection);
    setEditingLoggedAt(food.loggedAt);
  };

  const handleSaveEdit = () => {
    if (!editingFoodId || !editingName || !editingCalories) {
      return;
    }

    updateFoodList((prev) =>
      prev.map((item) =>
        item.id === editingFoodId
          ? {
              ...item,
              name: editingName,
              calories: Number(editingCalories),
              mealSection: editingMealSection,
              loggedAt: editingLoggedAt,
              portionMultiplier: Number(editingPortionMultiplier) || 1,
              consumedGrams: editingConsumedGrams ? Number(editingConsumedGrams) : undefined,
              note: buildFoodNote({
                mealSection: editingMealSection,
                source: item.source ?? (item.note?.includes("검색 결과") ? "search" : "manual"),
                portionMultiplier: Number(editingPortionMultiplier) || 1,
                consumedGrams: editingConsumedGrams ? Number(editingConsumedGrams) : undefined,
              }),
            }
          : item,
      ),
    );

    setEditingFoodId(null);
    setEditingName("");
    setEditingCalories("");
    setEditingPortionMultiplier("1");
    setEditingConsumedGrams("");
    setEditingMealSection("간식");
    setEditingLoggedAt(getLocalDateKey());
  };

  const handleCloseEdit = () => {
    setEditingFoodId(null);
    setEditingName("");
    setEditingCalories("");
    setEditingPortionMultiplier("1");
    setEditingConsumedGrams("");
    setEditingMealSection("간식");
    setEditingLoggedAt(getLocalDateKey());
  };

  return (
    <AppShell
      eyebrow="Food log"
      title="Food"
      description="오늘 먹은 음식과 칼로리를 편하게 기록해보세요."
    >
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Today intake
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">{totalCalories} kcal</h2>
        <p className="mt-1 text-sm text-muted">
          목표 {dailyTargetCalories} kcal 중 {targetPercent}%예요
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Badge>오늘 총 {totalCalories} kcal</Badge>
        <Badge style={{ background: "rgb(var(--color-peach) / 0.95)", color: "rgb(var(--color-ink))" }}>
          {recordedSections.length ? recordedSections.join(" · ") : "아직 기록 전"}
        </Badge>
      </div>

      <Card>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              Today foods
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">오늘 기록한 음식</h2>
            <p className="mt-1 text-sm text-muted">
              오늘 먹은 음식이 여기에 차곡차곡 쌓여요.
            </p>
          </div>
          <div className="rounded-full bg-sage/80 px-4 py-2 text-sm font-semibold text-ink">
            {recordedSections.length ? recordedSections.join(" · ") : "아직 기록 없음"}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => setSearchOpen(true)} className="px-5">
            음식 검색으로 추가
          </Button>
          <Button variant="secondary" onClick={() => setManualOpen(true)}>
            직접 입력
          </Button>
        </div>
      </Card>

      <Card>
        {todayFoodList.length === 0 ? (
          <p className="mt-4 text-sm text-muted">아직 저장된 음식이 없어요.</p>
        ) : (
          <div className="mt-4 space-y-5">
            {groupedFoods.map(({ section, items, total }) =>
              items.length ? (
                <div key={section}>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-ink">{section}</h3>
                      <p className="text-xs text-muted">{items.length}개 기록</p>
                    </div>
                    <div className="rounded-full bg-peach px-3 py-1 text-xs font-semibold text-ink">
                      {total} kcal
                    </div>
                  </div>

                  <div className="space-y-3">
                    {items.map((food) => (
                      <div
                        key={food.id}
                        className="flex items-center justify-between rounded-[22px] border border-line/80 bg-white/70 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink">{food.name}</p>
                          <p className="mt-1 text-xs text-muted">
                            {food.note ?? "직접 입력 기록"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-sage/70 px-3 py-1 text-xs font-semibold text-ink">
                            {food.calories} kcal
                          </div>
                          <Button
                            variant="secondary"
                            className="px-3 py-2 text-xs"
                            onClick={() => handleStartEdit(food)}
                          >
                            수정
                          </Button>
                          <Button
                            variant="ghost"
                            className="px-3 py-2 text-xs"
                            onClick={() => handleDeleteFood(food.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null,
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="오늘 섭취"
          value={`${totalCalories} kcal`}
          helper="현재까지 누적"
          accent="rose"
        />
        <StatCard
          label="목표 대비"
          value={`${targetPercent}%`}
          helper={`${dailyTargetCalories} kcal 기준`}
          accent="sage"
        />
      </div>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Quick choices
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">빠른 기록 버튼</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          어제 먹었던 아침, 점심, 저녁 세트를 오늘로 빠르게 다시 넣을 수 있어요.
        </p>

        <div className="mt-4 space-y-3">
          {yesterdayGroupedFoods.map(({ section, items }) => (
            <div
              key={section}
              className="rounded-[22px] border border-line/80 bg-white/70 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">어제 {section}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {items.length
                      ? items.map((item) => item.name).join(", ")
                      : `어제 ${section} 기록이 없어요.`}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleRepeatYesterdayMeal(section)}
                  disabled={items.length === 0}
                >
                  다시 추가
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <FoodSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onAddMeal={handleAddMealFromSearch}
      />

      <Dialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title="직접 입력"
        description="검색 결과가 없거나 바로 적고 싶을 때 직접 입력할 수 있어요."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">식사 시간</label>
            <div className="grid grid-cols-4 gap-2">
              {mealSections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setManualMealSection(section)}
                  className="rounded-full border px-3 py-2 text-sm font-semibold transition"
                  style={{
                    borderColor:
                      manualMealSection === section
                        ? "rgba(16,185,129,0.36)"
                        : "rgb(var(--color-line) / 0.92)",
                    background:
                      manualMealSection === section
                        ? "rgba(16,185,129,0.12)"
                        : "var(--card-background-strong)",
                    color:
                      manualMealSection === section
                        ? "rgb(var(--color-coral))"
                        : "rgb(var(--color-muted))",
                  }}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="foodName" className="mb-2 block text-sm font-semibold text-ink">
              음식 이름
            </label>
            <Input
              id="foodName"
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="예: 바나나, 닭가슴살 샐러드"
            />
          </div>

          <div>
            <label htmlFor="portionMultiplier" className="mb-2 block text-sm font-semibold text-ink">
              섭취량 배수
            </label>
            <Input
              id="portionMultiplier"
              type="number"
              min="0.5"
              step="0.5"
              value={portionMultiplier}
              onChange={(e) => setPortionMultiplier(e.target.value)}
              placeholder="예: 1, 1.5"
            />
          </div>

          <div>
            <label htmlFor="consumedGrams" className="mb-2 block text-sm font-semibold text-ink">
              섭취량(g)
            </label>
            <Input
              id="consumedGrams"
              type="number"
              min="0"
              step="1"
              value={consumedGrams}
              onChange={(e) => setConsumedGrams(e.target.value)}
              placeholder="예: 180"
            />
          </div>

          <div>
            <label htmlFor="calories" className="mb-2 block text-sm font-semibold text-ink">
              칼로리
            </label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="예: 120"
            />
          </div>

          <Button
            onClick={() => {
              const saved = handleSave();
              if (saved) {
                setManualOpen(false);
              }
            }}
            className="w-full justify-center py-3 text-base"
          >
            저장하기
          </Button>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(editingFoodId)}
        onClose={handleCloseEdit}
        title="음식 기록 수정"
        description="이름, 칼로리, 식사 시간을 다시 정할 수 있어요."
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">식사 시간</label>
            <div className="grid grid-cols-4 gap-2">
              {mealSections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setEditingMealSection(section)}
                  className="rounded-full border px-3 py-2 text-sm font-semibold transition"
                  style={{
                    borderColor:
                      editingMealSection === section
                        ? "rgba(16,185,129,0.36)"
                        : "rgb(var(--color-line) / 0.92)",
                    background:
                      editingMealSection === section
                        ? "rgba(16,185,129,0.12)"
                        : "var(--card-background-strong)",
                    color:
                      editingMealSection === section
                        ? "rgb(var(--color-coral))"
                        : "rgb(var(--color-muted))",
                  }}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="editingName" className="mb-2 block text-sm font-semibold text-ink">
              음식 이름
            </label>
            <Input
              id="editingName"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="editingPortionMultiplier"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              섭취량 배수
            </label>
            <Input
              id="editingPortionMultiplier"
              type="number"
              min="0.5"
              step="0.5"
              value={editingPortionMultiplier}
              onChange={(e) => setEditingPortionMultiplier(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="editingConsumedGrams"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              섭취량(g)
            </label>
            <Input
              id="editingConsumedGrams"
              type="number"
              min="0"
              step="1"
              value={editingConsumedGrams}
              onChange={(e) => setEditingConsumedGrams(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="editingCalories"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              칼로리
            </label>
            <Input
              id="editingCalories"
              type="number"
              value={editingCalories}
              onChange={(e) => setEditingCalories(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="editingLoggedAt"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              기록 날짜
            </label>
            <Input
              id="editingLoggedAt"
              type="date"
              value={editingLoggedAt}
              onChange={(e) => setEditingLoggedAt(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveEdit} className="flex-1">
              저장
            </Button>
            <Button variant="secondary" onClick={handleCloseEdit} className="flex-1">
              취소
            </Button>
          </div>
        </div>
      </Dialog>
    </AppShell>
  );
}
