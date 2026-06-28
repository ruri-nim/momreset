"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/common/StatCard";
import { AppShell } from "@/components/diet-app/app-shell";
import { CheckRow } from "@/components/diet-app/check-row";
import { SmileChip } from "@/components/diet-app/smile-chip";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { calculateDailyTargetCalories, DEFAULT_DAILY_TARGET_CALORIES } from "@/lib/diet-app-calorie-target";
import {
  formatMonthTitle,
  getCurrentMonthMeta,
  getDateKeyDaysAgo,
  getLocalDateKey,
} from "@/lib/diet-app-date";
import {
  DAILYOK_LOCAL_EVENT,
  getRuleHistoryForDate,
  loadAvoidRules,
  loadBodyWeightKg,
  loadDoRules,
  loadExerciseLogs,
  loadFoodList,
  loadOnboardingProfile,
  loadRuleHistory,
  saveAvoidRules,
  saveDoRules,
  saveRuleStatusesForDate,
} from "@/lib/diet-app-storage";
import { getSmileLevelForDay } from "@/lib/smile-score";
import type {
  ExerciseLogItem,
  RuleHistoryEntry,
  RuleItem,
} from "@/types/diet-app";

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

const smileStickerMap = {
  very_happy: { emoji: "😎", tint: "bg-[#ffe066]", ring: "ring-[#ffca28]" },
  happy: { emoji: "☺️", tint: "bg-[#ffd166]", ring: "ring-[#ffb74d]" },
  neutral: { emoji: "🙄", tint: "bg-[#ffb88c]", ring: "ring-[#f39c6b]" },
  sad: { emoji: "☹️", tint: "bg-[#ff8a80]", ring: "ring-[#ff6f61]" },
  very_sad: { emoji: "😭", tint: "bg-[#ff5252]", ring: "ring-[#e53935]" },
} as const;

interface HomeFoodItem {
  id: string;
  name: string;
  calories: number;
  mealSection?: "아침" | "점심" | "저녁" | "간식";
  loggedAt: string;
}

export default function Page() {
  const today = new Date();
  const todayKey = getLocalDateKey(today);

  const [foodList, setFoodList] = useState<HomeFoodItem[]>([]);
  const [doRules, setDoRules] = useState<RuleItem[]>([]);
  const [avoidRules, setAvoidRules] = useState<RuleItem[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLogItem[]>([]);
  const [ruleHistory, setRuleHistory] = useState<RuleHistoryEntry[]>([]);
  const [dailyTargetCalories, setDailyTargetCalories] = useState(DEFAULT_DAILY_TARGET_CALORIES);
  const [editDialog, setEditDialog] = useState<"food" | "exercise" | "rules" | null>(null);
  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const { year, month, firstWeekday, daysInMonth } = getCurrentMonthMeta(currentMonthDate);
  const isCurrentMonth =
    currentMonthDate.getFullYear() === today.getFullYear() &&
    currentMonthDate.getMonth() === today.getMonth();

  useEffect(() => {
    const loadData = () => {
      const savedDoRules = loadDoRules();
      const savedAvoidRules = loadAvoidRules();
      const todayHistory = getRuleHistoryForDate(todayKey);
      const profile = loadOnboardingProfile();
      const currentWeightKg = loadBodyWeightKg();

      setFoodList(loadFoodList() as HomeFoodItem[]);
      setDoRules(
        savedDoRules.map((item) => ({
          ...item,
          status: todayHistory?.doRuleStatuses[item.id] ?? "pending",
        })),
      );
      setAvoidRules(
        savedAvoidRules.map((item) => ({
          ...item,
          status: todayHistory?.avoidRuleStatuses[item.id] ?? "pending",
        })),
      );
      setExerciseLogs(loadExerciseLogs());
      setRuleHistory(loadRuleHistory());
      setDailyTargetCalories(calculateDailyTargetCalories(currentWeightKg, profile));
    };

    loadData();
    window.addEventListener(DAILYOK_LOCAL_EVENT, loadData);

    return () => {
      window.removeEventListener(DAILYOK_LOCAL_EVENT, loadData);
    };
  }, [todayKey]);

  useEffect(() => {
    setSelectedDay((prev) => Math.min(prev, daysInMonth));
  }, [daysInMonth]);

  useEffect(() => {
    const onStorage = () => {
      const savedDoRules = loadDoRules();
      const savedAvoidRules = loadAvoidRules();
      const todayHistory = getRuleHistoryForDate(todayKey);
      const profile = loadOnboardingProfile();
      const currentWeightKg = loadBodyWeightKg();

      setFoodList(loadFoodList() as HomeFoodItem[]);
      setDoRules(
        savedDoRules.map((item) => ({
          ...item,
          status: todayHistory?.doRuleStatuses[item.id] ?? "pending",
        })),
      );
      setAvoidRules(
        savedAvoidRules.map((item) => ({
          ...item,
          status: todayHistory?.avoidRuleStatuses[item.id] ?? "pending",
        })),
      );
      setExerciseLogs(loadExerciseLogs());
      setRuleHistory(loadRuleHistory());
      setDailyTargetCalories(calculateDailyTargetCalories(currentWeightKg, profile));
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [todayKey]);

  const todayFoodList = useMemo(
    () => foodList.filter((item) => item.loggedAt === todayKey),
    [foodList, todayKey],
  );
  const todayExerciseLogs = useMemo(
    () => exerciseLogs.filter((item) => item.loggedAt === todayKey),
    [exerciseLogs, todayKey],
  );
  const todayRuleHistory = ruleHistory.find((item) => item.date === todayKey) ?? null;
  const todayDoDoneCount = Object.values(todayRuleHistory?.doRuleStatuses ?? {}).filter(
    (status) => status === "done",
  ).length;
  const todayAvoidDoneCount = Object.values(
    todayRuleHistory?.avoidRuleStatuses ?? {},
  ).filter((status) => status === "done").length;
  const todayDoFailedCount = Object.values(todayRuleHistory?.doRuleStatuses ?? {}).filter(
    (status) => status === "failed",
  ).length;
  const todayAvoidFailedCount = Object.values(
    todayRuleHistory?.avoidRuleStatuses ?? {},
  ).filter((status) => status === "failed").length;

  const totalCalories = todayFoodList.reduce((sum, item) => sum + item.calories, 0);
  const totalBurnedCalories = todayExerciseLogs.reduce(
    (sum, item) => sum + item.burnedCalories,
    0,
  );
  const netCalories = totalCalories - totalBurnedCalories;
  const targetPercent = Math.min(
    100,
    Math.max(0, Math.round((netCalories / dailyTargetCalories) * 100)),
  );

  const calorieStatusText =
    totalCalories === 0
      ? "아직 음식 기록이 없어요"
      : netCalories <= dailyTargetCalories
        ? "칼로리 목표는 현재 범위 안이에요"
        : "목표 칼로리를 조금 넘기고 있어요";

  const okCount =
    todayDoDoneCount +
    todayAvoidDoneCount +
    (totalCalories > 0 && netCalories <= dailyTargetCalories ? 1 : 0);
  const xCount =
    todayDoFailedCount +
    todayAvoidFailedCount +
    (netCalories > dailyTargetCalories ? 1 : 0);

  const updateRuleStatus = (
    type: "do" | "avoid",
    id: string,
    status: RuleItem["status"],
  ) => {
    if (type === "do") {
      const next = doRules.map((item) => (item.id === id ? { ...item, status } : item));
      setDoRules(next);
      saveDoRules(next);
      saveRuleStatusesForDate(todayKey, next, avoidRules);
      return;
    }

    const next = avoidRules.map((item) => (item.id === id ? { ...item, status } : item));
    setAvoidRules(next);
    saveAvoidRules(next);
    saveRuleStatusesForDate(todayKey, doRules, next);
  };

  const calendarCells = useMemo(() => {
    const blanks = Array.from({ length: firstWeekday }, (_, index) => ({
      key: `blank-${index}`,
      day: null,
      level: null,
    }));

    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateKey = `${year}-${`${month + 1}`.padStart(2, "0")}-${`${day}`.padStart(2, "0")}`;
      const dayFoods = foodList.filter((item) => item.loggedAt === dateKey);
      const dayExercises = exerciseLogs.filter((item) => item.loggedAt === dateKey);
      const dayRuleHistory = ruleHistory.find((item) => item.date === dateKey) ?? null;
      const totalDayCalories = dayFoods.reduce((sum, item) => sum + item.calories, 0);
      const totalDayBurnedCalories = dayExercises.reduce(
        (sum, item) => sum + item.burnedCalories,
        0,
      );
      const netDayCalories = totalDayCalories - totalDayBurnedCalories;
      const dayDoStatuses = Object.values(dayRuleHistory?.doRuleStatuses ?? {});
      const dayAvoidStatuses = Object.values(dayRuleHistory?.avoidRuleStatuses ?? {});
      const dayDoneCount = [...dayDoStatuses, ...dayAvoidStatuses].filter(
        (status) => status === "done",
      ).length;
      const dayFailedCount = [...dayDoStatuses, ...dayAvoidStatuses].filter(
        (status) => status === "failed",
      ).length;
      const hasData =
        dayFoods.length > 0 ||
        dayExercises.length > 0 ||
        dayDoneCount > 0 ||
        dayFailedCount > 0;

      return {
        key: dateKey,
        day,
        dateKey,
        level: hasData
          ? getSmileLevelForDay(
              netDayCalories,
              dayFoods.length > 0,
              dayDoneCount,
              dayFailedCount,
              dailyTargetCalories,
            )
          : null,
      };
    });

    return [...blanks, ...days];
  }, [dailyTargetCalories, daysInMonth, exerciseLogs, firstWeekday, foodList, month, ruleHistory, year]);

  const selectedDateKey = `${year}-${`${month + 1}`.padStart(2, "0")}-${`${selectedDay}`.padStart(2, "0")}`;
  const selectedFoods = foodList.filter((item) => item.loggedAt === selectedDateKey);
  const selectedExercises = exerciseLogs.filter((item) => item.loggedAt === selectedDateKey);
  const selectedRuleHistory = ruleHistory.find((item) => item.date === selectedDateKey) ?? null;
  const selectedCalories = selectedFoods.reduce((sum, item) => sum + item.calories, 0);
  const selectedBurnedCalories = selectedExercises.reduce(
    (sum, item) => sum + item.burnedCalories,
    0,
  );
  const selectedNetCalories = selectedCalories - selectedBurnedCalories;
  const selectedDoStatuses = Object.values(selectedRuleHistory?.doRuleStatuses ?? {});
  const selectedAvoidStatuses = Object.values(selectedRuleHistory?.avoidRuleStatuses ?? {});
  const selectedDoneCount = [...selectedDoStatuses, ...selectedAvoidStatuses].filter(
    (status) => status === "done",
  ).length;
  const selectedFailedCount = [...selectedDoStatuses, ...selectedAvoidStatuses].filter(
    (status) => status === "failed",
  ).length;
  const selectedLevel =
    selectedFoods.length || selectedExercises.length || selectedDoneCount || selectedFailedCount
      ? getSmileLevelForDay(
          selectedNetCalories,
          selectedFoods.length > 0,
          selectedDoneCount,
          selectedFailedCount,
          dailyTargetCalories,
        )
      : null;
  const selectedOk =
    (selectedCalories > 0 && selectedNetCalories <= dailyTargetCalories ? 1 : 0) + selectedDoneCount;
  const selectedX =
    (selectedNetCalories > dailyTargetCalories ? 1 : 0) + selectedFailedCount;
  const selectedDateLabel = `${month + 1}월 ${selectedDay}일`;
  const editDialogLabel =
    editDialog === "food" ? "음식" : editDialog === "exercise" ? "운동" : "규칙";

  const closeEditDialog = () => {
    setEditDialog(null);
    window.dispatchEvent(new Event("storage"));
  };

  const mealSectionTotals = ["아침", "점심", "저녁", "간식"].map((section) => ({
    section,
    total: todayFoodList
      .filter((item) => item.mealSection === section)
      .reduce((sum, item) => sum + item.calories, 0),
  }));
  const highestMealSection = mealSectionTotals.sort((a, b) => b.total - a.total)[0];

  const recentThreeDayCalories = [0, 1, 2].map((daysAgo) => {
    const key = getDateKeyDaysAgo(daysAgo, today);
    return foodList
      .filter((item) => item.loggedAt === key)
      .reduce((sum, item) => sum + item.calories, 0);
  });
  const averageRecentCalories = Math.round(
    recentThreeDayCalories.reduce((sum, value) => sum + value, 0) / recentThreeDayCalories.length,
  );

  const feedbackText =
    totalCalories === 0
      ? "오늘은 아직 식단 기록이 없어요. 한 끼만 먼저 적어도 흐름을 읽기 훨씬 쉬워져요."
      : highestMealSection.total > dailyTargetCalories * 0.45
        ? `${highestMealSection.section} 비중이 가장 커요. 한 끼에 몰아먹는 패턴만 조금 풀어도 전체 흐름이 훨씬 편해질 수 있어요.`
        : averageRecentCalories > dailyTargetCalories
          ? "최근 3일 평균이 목표보다 조금 높아요. 양을 확 줄이기보다 간식이나 저녁 한 군데만 조정해보는 게 더 현실적이에요."
          : "요즘은 전체 칼로리 흐름이 비교적 안정적이에요. 지금 패턴을 유지하면서 단백질이나 수분만 조금 더 챙겨도 좋아요.";

  const nextActionText =
    totalCalories === 0
      ? "오늘 먹은 것 중 가장 기억나는 한 가지부터 먼저 기록해보세요."
      : highestMealSection.section === "저녁"
        ? "내일은 저녁 전에 단백질 간식 하나를 먼저 넣어보세요."
        : highestMealSection.section === "간식"
          ? "내일은 첫 간식을 먹기 전에 물 한 컵을 먼저 마셔보세요."
          : "지금처럼 기록을 이어가면서 한 끼만 조금 더 균형 있게 조절해보세요.";

  return (
    <AppShell
      eyebrow="Home"
      title="Home"
      description="오늘 기록과 기분을 한눈에 가볍게 확인해보세요."
    >
      <Card className="overflow-hidden rounded-[24px] p-0 sm:rounded-[30px]">
        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,245,249,0.96))] px-3 py-4 sm:px-5 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                {formatMonthTitle(currentMonthDate)}
              </p>
              <h2 className="mt-1.5 whitespace-nowrap text-[1.45rem] font-semibold text-ink sm:mt-2 sm:text-[1.8rem]">Smile Calendar</h2>
              <p className="mt-1.5 text-[13px] leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
                기록이 쌓일수록 한 달 흐름이 스티커처럼 보여요.
              </p>
            </div>
            <div className="hidden shrink-0 whitespace-nowrap rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-ink shadow-soft sm:block">
              Sticker view
            </div>
          </div>

          <div className="mt-4 rounded-[20px] border border-white/80 bg-[linear-gradient(180deg,#fffef8,#fff)] p-2 shadow-soft sm:mt-5 sm:rounded-[28px] sm:p-4">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="whitespace-nowrap text-center text-[10px] font-bold text-muted sm:text-[11px] sm:tracking-[0.18em]"
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1 sm:mt-3 sm:gap-2">
              {calendarCells.map((cell) => {
                if (!cell.day) {
                  return (
                    <div
                      key={cell.key}
                      className="aspect-square rounded-[12px] bg-white/40 sm:aspect-[0.88] sm:rounded-[18px]"
                    />
                  );
                }

                const sticker = cell.level ? smileStickerMap[cell.level] : null;

                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDay(cell.day)}
                    className={`group relative aspect-square rounded-[12px] border bg-white p-1 text-left shadow-[0_4px_12px_rgba(187,167,177,0.1)] transition hover:-translate-y-0.5 sm:aspect-[0.88] sm:rounded-[20px] sm:p-2 sm:shadow-[0_8px_22px_rgba(187,167,177,0.12)] ${
                      selectedDay === cell.day
                        ? "border-coral ring-2 ring-coral/20"
                        : "border-[#f1e8ef]"
                    }`}
                  >
                    <span className="whitespace-nowrap text-[9px] font-bold text-muted sm:text-[11px]">{cell.day}</span>
                    {sticker ? (
                      <span
                        className={`absolute left-1/2 top-[57%] inline-flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.08)] ring-1 sm:top-[54%] sm:h-10 sm:w-10 sm:text-xl sm:shadow-[0_8px_18px_rgba(0,0,0,0.08)] sm:ring-2 ${sticker.tint} ${sticker.ring} rotate-[-6deg] group-hover:rotate-0`}
                      >
                        {sticker.emoji}
                      </span>
                    ) : (
                      <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-line/80 sm:bottom-2 sm:h-2 sm:w-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:mt-4 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                const previousMonth = new Date(currentMonthDate);
                previousMonth.setMonth(currentMonthDate.getMonth() - 1);
                setCurrentMonthDate(new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1));
                setSelectedDay(1);
              }}
              className="whitespace-nowrap rounded-full border border-line bg-white/85 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-white sm:px-4 sm:text-sm"
            >
              이전 달
            </button>
            <p className="truncate text-center text-[10px] font-semibold tracking-[0.08em] text-muted sm:text-xs sm:uppercase sm:tracking-[0.18em]">
              지난 기록 보기
            </p>
            <button
              type="button"
              onClick={() => {
                if (isCurrentMonth) {
                  return;
                }

                const nextMonth = new Date(currentMonthDate);
                nextMonth.setMonth(currentMonthDate.getMonth() + 1);
                setCurrentMonthDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
                setSelectedDay(1);
              }}
              disabled={isCurrentMonth}
              className="whitespace-nowrap rounded-full border border-line bg-white/85 px-3 py-2 text-xs font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45 sm:px-4 sm:text-sm"
            >
              다음 달
            </button>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-1 sm:mt-4 sm:flex sm:flex-wrap sm:gap-2">
            <Badge className="justify-center px-1 text-[10px] sm:px-3 sm:text-xs" style={{ background: "#ffe066", color: "#6b5200" }}>😎 최고</Badge>
            <Badge className="justify-center px-1 text-[10px] sm:px-3 sm:text-xs" style={{ background: "#ffd166", color: "#6a4700" }}>☺️ 좋아요</Badge>
            <Badge className="justify-center px-1 text-[10px] sm:px-3 sm:text-xs" style={{ background: "#ffb88c", color: "#74411d" }}>🙄 보통</Badge>
            <Badge className="justify-center px-1 text-[10px] sm:px-3 sm:text-xs" style={{ background: "#ff8a80", color: "#7a1f12" }}>☹️ 아쉬움</Badge>
            <Badge className="justify-center px-1 text-[10px] sm:px-3 sm:text-xs" style={{ background: "#ff5252", color: "#6f0f12" }}>😭 속상</Badge>
          </div>
          <div className="mt-3 rounded-[18px] bg-white/80 px-3.5 py-3.5 ring-1 ring-line/70 sm:mt-4 sm:rounded-[22px] sm:px-4 sm:py-4">
            <p className="text-sm font-semibold leading-5 text-ink">
              {selectedDay}일 기록
              {selectedLevel ? ` · ${selectedLevel}` : " · 기록 없음"}
            </p>
            <p className="mt-1.5 text-[13px] leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
              OK {selectedOk}개 / X {selectedX}개
              {` · 순섭취 ${selectedNetCalories} kcal`}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
              <button
                type="button"
                onClick={() => setEditDialog("food")}
                className="whitespace-nowrap rounded-full border border-line bg-white px-2 py-2 text-[11px] font-semibold text-ink sm:px-3 sm:text-xs"
              >
                음식 수정
              </button>
              <button
                type="button"
                onClick={() => setEditDialog("exercise")}
                className="whitespace-nowrap rounded-full border border-line bg-white px-2 py-2 text-[11px] font-semibold text-ink sm:px-3 sm:text-xs"
              >
                운동 수정
              </button>
              <button
                type="button"
                onClick={() => setEditDialog("rules")}
                className="whitespace-nowrap rounded-full border border-line bg-white px-2 py-2 text-[11px] font-semibold text-ink sm:px-3 sm:text-xs"
              >
                규칙 수정
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="오늘 OK" value={`${okCount}개`} helper="잘 지킨 항목" accent="sage" />
        <StatCard label="오늘 X" value={`${xCount}개`} helper="놓친 항목" accent="rose" />
      </div>

      <Card className="overflow-hidden rounded-[28px] p-0">
        <div className="bg-[linear-gradient(135deg,rgba(226,244,232,0.95),rgba(255,255,255,0.98))] px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Calorie guide
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">{calorieStatusText}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                먹은 칼로리에서 운동으로 소모한 칼로리를 뺀 값이에요.
              </p>
            </div>
            <SmileChip
              level={
                totalCalories === 0
                  ? "neutral"
                  : netCalories <= dailyTargetCalories
                    ? "happy"
                    : "sad"
              }
              compact
            />
          </div>

          <div className="mt-4 rounded-[22px] bg-white/80 px-4 py-4 ring-1 ring-line/70">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink">오늘 순섭취 칼로리</span>
              <span className="whitespace-nowrap text-muted">
                {netCalories} / {dailyTargetCalories} kcal
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">
              섭취 {totalCalories} - 운동 {totalBurnedCalories} = 순섭취 {netCalories} kcal
            </p>
            <div className="mt-3 h-3 rounded-full bg-peach">
              <div
                className="h-3 rounded-full bg-coral"
                style={{ width: `${targetPercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Avoid first
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">피해야 할 일</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          오늘 피하고 싶은 행동을 가볍게 체크해보세요.
        </p>
        <div className="mt-4 space-y-3">
          {avoidRules.map((item) => (
            <CheckRow
              key={item.id}
              item={item}
              tone="avoid"
              onChangeStatus={(id, status) => updateRuleStatus("avoid", id, status)}
              showPendingAction={false}
            />
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Do next
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">해야 할 일</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          오늘 해보고 싶은 작은 목표를 체크해보세요.
        </p>
        <div className="mt-4 space-y-3">
          {doRules.map((item) => (
            <CheckRow
              key={item.id}
              item={item}
              tone="do"
              onChangeStatus={(id, status) => updateRuleStatus("do", id, status)}
              showPendingAction={false}
            />
          ))}
        </div>
      </Card>

      <Card className="bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(226,244,232,0.92))]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          AI feedback
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">오늘의 피드백</h2>
        <p className="mt-3 text-sm leading-7 text-muted">{feedbackText}</p>
        <div className="mt-4 rounded-[20px] border border-white/80 bg-white/75 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Next action
          </p>
          <p className="mt-2 text-sm text-ink">{nextActionText}</p>
        </div>
      </Card>

      <Dialog
        open={Boolean(editDialog)}
        onClose={closeEditDialog}
        title={`${selectedDateLabel} ${editDialogLabel} 수정`}
        description={`${selectedDateLabel}에 남긴 ${editDialogLabel} 기록을 확인하고 바로 고칠 수 있어요.`}
        className="max-w-[720px]"
        panelStyle={{ maxWidth: 720 }}
        bodyClassName="overflow-hidden"
      >
        {editDialog ? (
          <iframe
            key={`${editDialog}-${selectedDateKey}`}
            title={`${selectedDateLabel} ${editDialogLabel} 수정`}
            src={`/${editDialog}?date=${selectedDateKey}&embed=1`}
            className="h-[65vh] w-full rounded-[22px] border-0 bg-transparent"
          />
        ) : null}
      </Dialog>
    </AppShell>
  );
}
