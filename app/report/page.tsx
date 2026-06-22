"use client";

import { useEffect, useState } from "react";
import ChartBlock from "@/components/common/ChartBlock";
import StatCard from "@/components/common/StatCard";
import { AppShell } from "@/components/diet-app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateDailyTargetCalories } from "@/lib/diet-app-calorie-target";
import { formatDateLabel, isDateWithinLastDays } from "@/lib/diet-app-date";
import {
  loadAvoidRules,
  loadBodyWeightKg,
  loadDoRules,
  loadExerciseLogs,
  loadOnboardingProfile,
  loadRuleHistory,
  loadWeightHistory,
  resetDietAppStorage,
  saveBodyWeightKg,
  saveOnboardingProfile,
  saveWeightHistory,
} from "@/lib/diet-app-storage";
import {
  buildWeeklyInsightSummary,
  generateRuleBasedWeeklyFeedback,
  getWeeklyPatternLines,
  type WeeklyAiFeedback,
  type WeeklyFoodLogItem,
  type WeeklyInsightSummary,
} from "@/lib/weekly-feedback";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import type { OnboardingProfile, WeightLogItem } from "@/types/diet-app";

type WeightRange = 7 | 30 | 90;

const rangeOptions: WeightRange[] = [7, 30, 90];
const challengeOptions: OnboardingProfile["challenge"][] = [
  "야식",
  "단음식",
  "배달음식",
  "불규칙한 식사",
  "술 마시기",
  "움직이지 않기",
];
const paceOptions: OnboardingProfile["pace"][] = ["가볍게", "꾸준하게", "집중해서"];
const coachToneOptions: OnboardingProfile["coachTone"][] = ["다정하게", "솔직하게", "발랄하게"];

function ChoiceChip({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-4 py-2 text-sm font-semibold transition"
      style={{
        borderColor: selected ? "rgba(255, 140, 102, 0.65)" : "rgb(var(--color-line) / 0.92)",
        background: selected ? "rgba(255, 224, 102, 0.32)" : "rgba(255,255,255,0.82)",
        color: "rgb(var(--color-ink))",
        boxShadow: selected ? "0 8px 20px rgba(255, 171, 64, 0.18)" : "none",
      }}
    >
      {label}
    </button>
  );
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const FOOD_LIST_STORAGE_KEY = "food-list";

function loadStoredFoods() {
  if (typeof window === "undefined") {
    return [] as WeeklyFoodLogItem[];
  }

  try {
    const raw = window.localStorage.getItem(FOOD_LIST_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WeeklyFoodLogItem[]) : [];
  } catch {
    return [] as WeeklyFoodLogItem[];
  }
}

export default function ReportPage() {
  const { data: session, status } = useSession();
  const [bodyWeightKgInput, setBodyWeightKgInput] = useState("55");
  const [weightHistory, setWeightHistory] = useState<WeightLogItem[]>([]);
  const [selectedRange, setSelectedRange] = useState<WeightRange>(7);
  const [saveMessage, setSaveMessage] = useState("");
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [providerLoadFailed, setProviderLoadFailed] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [goalWeightKgInput, setGoalWeightKgInput] = useState("50");
  const [targetDateInput, setTargetDateInput] = useState("");
  const [challengeInput, setChallengeInput] = useState<OnboardingProfile["challenge"]>("야식");
  const [paceInput, setPaceInput] = useState<OnboardingProfile["pace"]>("꾸준하게");
  const [coachToneInput, setCoachToneInput] = useState<OnboardingProfile["coachTone"]>("발랄하게");
  const [customDailyTargetInput, setCustomDailyTargetInput] = useState("");
  const [profileSaveMessage, setProfileSaveMessage] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalStep, setProfileModalStep] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyInsightSummary | null>(null);
  const [weeklyPatternLines, setWeeklyPatternLines] = useState<string[]>([]);
  const [weeklyFeedback, setWeeklyFeedback] = useState<WeeklyAiFeedback | null>(null);
  const [weeklyFeedbackSource, setWeeklyFeedbackSource] = useState<"ai" | "fallback">("fallback");
  const [weeklyFeedbackLoading, setWeeklyFeedbackLoading] = useState(true);

  useEffect(() => {
    const loadedWeight = loadBodyWeightKg();
    const loadedProfile = loadOnboardingProfile();

    setBodyWeightKgInput(String(loadedWeight));
    setWeightHistory(loadWeightHistory());
    setProfile(loadedProfile);
    setGoalWeightKgInput(String(loadedProfile?.goalWeightKg ?? 50));
    setTargetDateInput(loadedProfile?.targetDate ?? "");
    setChallengeInput(loadedProfile?.challenge ?? "야식");
    setPaceInput(loadedProfile?.pace ?? "꾸준하게");
    setCoachToneInput(loadedProfile?.coachTone ?? "발랄하게");
    setCustomDailyTargetInput(
      loadedProfile?.customDailyTargetCalories
        ? String(loadedProfile.customDailyTargetCalories)
        : "",
    );
    getProviders()
      .then((providers) => {
        setAvailableProviders(Object.keys(providers ?? {}));
      })
      .catch(() => {
        setProviderLoadFailed(true);
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const appliedProfile = loadOnboardingProfile();
    const appliedWeightHistory = loadWeightHistory();
    const appliedWeight = appliedWeightHistory[0]?.weightKg ?? loadBodyWeightKg();
    const appliedGoalCalories = calculateDailyTargetCalories(appliedWeight, appliedProfile);
    const nextSummary = buildWeeklyInsightSummary({
      foods: loadStoredFoods(),
      exerciseLogs: loadExerciseLogs(),
      ruleHistory: loadRuleHistory(),
      doRules: loadDoRules(),
      avoidRules: loadAvoidRules(),
      weightHistory: appliedWeightHistory,
      profile: appliedProfile,
      goalCalories: appliedGoalCalories,
    });

    setWeeklySummary(nextSummary);
    setWeeklyPatternLines(getWeeklyPatternLines(nextSummary));
    setWeeklyFeedback(generateRuleBasedWeeklyFeedback(nextSummary));
    setWeeklyFeedbackSource("fallback");
    setWeeklyFeedbackLoading(true);

    fetch("/api/weekly-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ summary: nextSummary }),
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          feedback?: WeeklyAiFeedback;
          source?: "ai" | "fallback";
        };

        if (payload.feedback) {
          setWeeklyFeedback(payload.feedback);
          setWeeklyFeedbackSource(payload.source ?? "fallback");
        }
      })
      .catch(() => {
        setWeeklyFeedback(generateRuleBasedWeeklyFeedback(nextSummary));
        setWeeklyFeedbackSource("fallback");
      })
      .finally(() => {
        setWeeklyFeedbackLoading(false);
      });
  }, [profile, weightHistory]);

  const currentWeight = weightHistory[0]?.weightKg ?? (Number(bodyWeightKgInput) || 55);
  const previewProfile: OnboardingProfile | null = targetDateInput
    ? {
        completedAt: profile?.completedAt ?? new Date().toISOString(),
        challenge: challengeInput,
        pace: paceInput,
        coachTone: coachToneInput,
        currentWeightKg: Number(bodyWeightKgInput) || currentWeight,
        goalWeightKg: Number(goalWeightKgInput) || 50,
        targetDate: targetDateInput,
        customDailyTargetCalories: customDailyTargetInput
          ? Number(customDailyTargetInput)
          : undefined,
      }
    : null;
  const calculatedTargetCalories = calculateDailyTargetCalories(
    Number(bodyWeightKgInput) || currentWeight,
    previewProfile,
  );
  const previousWeight = weightHistory[1]?.weightKg ?? currentWeight;
  const weightDelta = Number((currentWeight - previousWeight).toFixed(1));
  const filteredHistory = weightHistory
    .filter((item) => isDateWithinLastDays(item.date, selectedRange))
    .reverse();
  const weightChartData = filteredHistory.map((item) => ({
    label: formatDateLabel(item.date),
    value: item.weightKg,
  }));

  const handleSaveWeight = () => {
    const parsedWeight = Number(bodyWeightKgInput);

    if (!parsedWeight || parsedWeight <= 0) {
      alert("몸무게를 다시 입력해주세요.");
      return;
    }

    const todayKey = getTodayKey();
    const nextItem: WeightLogItem = {
      id: crypto.randomUUID(),
      date: todayKey,
      weightKg: parsedWeight,
    };

    const nextHistory =
      weightHistory[0]?.date === todayKey
        ? [{ ...weightHistory[0], weightKg: parsedWeight }, ...weightHistory.slice(1)]
        : [nextItem, ...weightHistory];

    setWeightHistory(nextHistory);
    saveBodyWeightKg(parsedWeight);
    saveWeightHistory(nextHistory);
    setSaveMessage(`${todayKey} 몸무게를 저장했어요.`);

    if (profile) {
      const nextProfile = { ...profile, currentWeightKg: parsedWeight };
      setProfile(nextProfile);
      saveOnboardingProfile(nextProfile);
    }
  };

  const handleSaveProfileSettings = () => {
    const parsedCurrentWeight = Number(bodyWeightKgInput);
    const parsedGoalWeight = Number(goalWeightKgInput);
    const parsedCustomTarget = customDailyTargetInput ? Number(customDailyTargetInput) : undefined;

    if (!parsedCurrentWeight || !parsedGoalWeight || !targetDateInput) {
      alert("현재 몸무게, 목표 몸무게, 목표 날짜를 먼저 입력해주세요.");
      return;
    }

    const nextProfile: OnboardingProfile = {
      completedAt: profile?.completedAt ?? new Date().toISOString(),
      challenge: challengeInput,
      pace: paceInput,
      coachTone: coachToneInput,
      currentWeightKg: parsedCurrentWeight,
      goalWeightKg: parsedGoalWeight,
      targetDate: targetDateInput,
      customDailyTargetCalories: parsedCustomTarget,
    };

    saveBodyWeightKg(parsedCurrentWeight);
    saveOnboardingProfile(nextProfile);
    setProfile(nextProfile);
    setProfileSaveMessage("목표와 다이어트 방식을 업데이트했어요.");
  };

  const openProfileModal = (step: number) => {
    setProfileModalStep(step);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfileFromModal = () => {
    handleSaveProfileSettings();
    setIsProfileModalOpen(false);
  };

  const handleResetRecords = () => {
    const shouldReset = window.confirm(
      "저장된 음식, 운동, 규칙, 몸무게 기록을 모두 초기화할까요?",
    );

    if (!shouldReset) {
      return;
    }

    resetDietAppStorage();
    setBodyWeightKgInput("55");
    setWeightHistory([]);
    setSelectedRange(7);
    setSaveMessage("기록을 모두 초기화했어요.");
    window.location.href = "/";
  };

  return (
    <AppShell
      eyebrow="My Progress"
      title="My Progress"
      description="몸무게와 기록 변화를 천천히 살펴보세요."
    >
      <div className="flex flex-wrap gap-2">
        <Badge>몸무게 리포트</Badge>
        <Badge style={{ background: "rgb(var(--color-peach) / 0.95)", color: "rgb(var(--color-ink))" }}>
          최근 {selectedRange}일 보기
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="현재 몸무게" value={`${currentWeight} kg`} helper="가장 최근 저장값" accent="rose" />
        <StatCard
          label="직전 대비"
          value={`${weightDelta > 0 ? "+" : ""}${weightDelta} kg`}
          helper="마지막 기록과 비교"
          accent="sage"
        />
      </div>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Calorie basis
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">칼로리 계산 기준</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          운동 칼로리는 이 몸무게를 기준으로 계산돼요.
        </p>
        <div className="mt-4 max-w-[220px]">
          <label htmlFor="bodyWeightKg" className="mb-2 block text-sm font-semibold text-ink">
            몸무게 기입
          </label>
          <Input
            id="bodyWeightKg"
            type="number"
            value={bodyWeightKgInput}
            onChange={(event) => setBodyWeightKgInput(event.target.value)}
            placeholder="예: 55"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button onClick={handleSaveWeight}>저장하기</Button>
          {saveMessage ? <p className="text-xs text-muted">{saveMessage}</p> : null}
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">
          계산식: `MET × 3.5 × 몸무게(kg) × 시간(분) / 200`
        </p>
      </Card>

      {isProfileModalOpen ? (
        <div
          className="fixed inset-0 z-[120] overflow-y-auto bg-[rgba(60,42,24,0.34)] px-4 py-8 backdrop-blur-sm"
        >
          <div className="mx-auto flex min-h-full w-full max-w-md items-center">
            <Card
              className="w-full overflow-hidden p-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,252,242,0.98), rgba(255,247,233,0.96))",
              }}
            >
              <div className="border-b border-line/70 px-6 pb-5 pt-6">
                <div className="flex items-center justify-between">
                  <p className="kitsch-title-soft text-[28px] uppercase tracking-[0.06em]">
                    Daily OK
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="rounded-full border border-line/80 bg-white/80 px-3 py-1 text-sm font-semibold text-ink"
                  >
                    닫기
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="h-2 flex-1 rounded-full"
                      style={{
                        background:
                          index <= profileModalStep
                            ? "linear-gradient(90deg,#ffd54f,#ffb74d)"
                            : "rgba(223, 197, 174, 0.5)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {profileModalStep === 0 ? (
                <div className="space-y-5 px-6 py-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                      Tiny survey
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-ink">내 리듬을 다시 골라봐요</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      지금 흐름에 맞게 다시 바꾸면 목표 칼로리도 더 자연스럽게 맞춰져요.
                    </p>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold text-ink">제일 흔들리기 쉬운 건?</p>
                    <div className="flex flex-wrap gap-2">
                      {challengeOptions.map((option) => (
                        <ChoiceChip
                          key={option}
                          label={option}
                          selected={challengeInput === option}
                          onClick={() => setChallengeInput(option)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold text-ink">어떤 속도로 가고 싶어요?</p>
                    <div className="flex flex-wrap gap-2">
                      {paceOptions.map((option) => (
                        <ChoiceChip
                          key={option}
                          label={option}
                          selected={paceInput === option}
                          onClick={() => setPaceInput(option)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold text-ink">AI 피드백 톤은?</p>
                    <div className="flex flex-wrap gap-2">
                      {coachToneOptions.map((option) => (
                        <ChoiceChip
                          key={option}
                          label={option}
                          selected={coachToneInput === option}
                          onClick={() => setCoachToneInput(option)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      className="flex-1 justify-center"
                      onClick={() => setIsProfileModalOpen(false)}
                    >
                      닫기
                    </Button>
                    <Button className="flex-1 justify-center" onClick={() => setProfileModalStep(1)}>
                      다음
                    </Button>
                  </div>
                </div>
              ) : null}

              {profileModalStep === 1 ? (
                <div className="space-y-5 px-6 py-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                      Goal setup
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-ink">목표를 다시 적어봐요</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      몸무게와 일정이 바뀌면 앱이 보는 칼로리 기준도 함께 달라져요.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="modalCurrentWeightKg">
                        현재 몸무게
                      </label>
                      <Input
                        id="modalCurrentWeightKg"
                        type="number"
                        value={bodyWeightKgInput}
                        onChange={(event) => setBodyWeightKgInput(event.target.value)}
                        placeholder="예: 55"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="modalGoalWeightKg">
                        목표 몸무게
                      </label>
                      <Input
                        id="modalGoalWeightKg"
                        type="number"
                        value={goalWeightKgInput}
                        onChange={(event) => setGoalWeightKgInput(event.target.value)}
                        placeholder="예: 50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="modalTargetDate">
                        목표 일정
                      </label>
                      <Input
                        id="modalTargetDate"
                        type="date"
                        value={targetDateInput}
                        onChange={(event) => setTargetDateInput(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-line/80 bg-white/75 px-4 py-4">
                    <p className="text-sm font-semibold text-ink">한 줄 요약</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {bodyWeightKgInput || "0"}kg에서 {goalWeightKgInput || "0"}kg까지,{" "}
                      {targetDateInput || "날짜 미정"} 목표예요.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      className="flex-1 justify-center"
                      onClick={() => setProfileModalStep(0)}
                    >
                      이전
                    </Button>
                    <Button className="flex-1 justify-center" onClick={handleSaveProfileFromModal}>
                      저장하기
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      ) : null}

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Weight range
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">몸무게 그래프 기간</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {rangeOptions.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className="rounded-full border px-4 py-2 text-sm font-semibold transition"
              style={{
                borderColor:
                  selectedRange === range
                    ? "rgba(16,185,129,0.36)"
                    : "rgb(var(--color-line) / 0.92)",
                background:
                  selectedRange === range
                    ? "rgba(16,185,129,0.12)"
                    : "var(--card-background-strong)",
                color:
                  selectedRange === range
                    ? "rgb(var(--color-coral))"
                    : "rgb(var(--color-muted))",
              }}
            >
              최근 {range}일
            </button>
          ))}
        </div>
      </Card>

      <ChartBlock
        title="몸무게 그래프"
        subtitle="기간을 바꿔가며 몸무게 변화를 확인해보세요."
        data={weightChartData}
      />

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Weight history
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">몸무게 기록</h2>
        <div className="mt-4 space-y-3">
          {weightHistory.length === 0 ? (
            <p className="text-sm text-muted">아직 저장한 몸무게 기록이 없어요.</p>
          ) : (
            weightHistory
              .filter((item) => isDateWithinLastDays(item.date, selectedRange))
              .map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-[22px] border border-line/80 bg-white/70 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{item.weightKg} kg</p>
                  <p className="mt-1 text-xs text-muted">{item.date}</p>
                </div>
                <div className="rounded-full bg-peach px-3 py-1 text-xs font-semibold text-ink">
                  저장됨
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Pattern summary
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">이번 주 패턴</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {weeklySummary
            ? `${weeklySummary.periodLabel} 기록을 바탕으로 흐름을 읽어봤어요.`
            : "이번 주 기록을 바탕으로 흐름을 읽어볼게요."}
        </p>
        <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
          {weeklyPatternLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </Card>

      <Card className="bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(252,253,252,0.94))]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          AI coach
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">주간 피드백</h2>
        <div className="mt-3 flex items-center gap-2">
          <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink">
            {weeklyFeedbackLoading
              ? "피드백 정리 중"
              : weeklyFeedbackSource === "ai"
                ? "AI가 읽어준 요약"
                : "기록 기반 요약"}
          </div>
          {weeklySummary ? (
            <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
              {weeklySummary.periodLabel}
            </div>
          ) : null}
        </div>

        <p className="mt-3 text-sm leading-7 text-muted">
          {weeklyFeedbackLoading
            ? "이번 주 기록을 읽고 있어요. 잠깐만 기다려주세요."
            : weeklyFeedback?.summary ?? "이번 주 흐름을 읽는 중이에요."}
        </p>

        <div className="mt-4 grid gap-3">
          <div className="rounded-[20px] border border-line/80 bg-white/75 px-4 py-4">
            <p className="text-sm font-semibold text-ink">잘한 점</p>
            <div className="mt-2 space-y-2 text-sm leading-6 text-muted">
              {(weeklyFeedback?.goodJob.length
                ? weeklyFeedback.goodJob
                : ["이번 주 기록만으로도 다음 흐름을 읽을 준비가 되고 있어요."]).map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-line/80 bg-white/75 px-4 py-4">
            <p className="text-sm font-semibold text-ink">조심할 점</p>
            <div className="mt-2 space-y-2 text-sm leading-6 text-muted">
              {(weeklyFeedback?.watchOut.length
                ? weeklyFeedback.watchOut
                : ["아직 눈에 띄는 무너짐은 크지 않아요. 지금처럼 기록을 이어가면 더 잘 보여요."]).map(
                (item) => (
                  <p key={item}>• {item}</p>
                ),
              )}
            </div>
          </div>

          <div className="rounded-[20px] border border-line/80 bg-white/75 px-4 py-4">
            <p className="text-sm font-semibold text-ink">다음 주 한 걸음</p>
            <div className="mt-2 space-y-2 text-sm leading-6 text-muted">
              {(weeklyFeedback?.nextAction.length
                ? weeklyFeedback.nextAction
                : ["다음 주에는 하루 한 번만 더 기록을 이어가봐요."]).map((item) => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Goal settings
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">목표와 방식 다시 정하기</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          온보딩 때 정한 목표 몸무게, 날짜, 진행 방식, 목표 칼로리를 나중에도 바꿀 수 있어요.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => openProfileModal(1)}
            className="rounded-[22px] border border-line/80 bg-white/75 px-4 py-4 text-left transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Goal</p>
            <p className="mt-2 text-base font-semibold text-ink">목표 몸무게</p>
            <p className="mt-1 text-sm text-muted">{goalWeightKgInput} kg</p>
          </button>

          <button
            type="button"
            onClick={() => openProfileModal(1)}
            className="rounded-[22px] border border-line/80 bg-white/75 px-4 py-4 text-left transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Date</p>
            <p className="mt-2 text-base font-semibold text-ink">목표 날짜</p>
            <p className="mt-1 text-sm text-muted">{targetDateInput || "아직 정하지 않았어요"}</p>
          </button>

          <button
            type="button"
            onClick={() => openProfileModal(0)}
            className="rounded-[22px] border border-line/80 bg-white/75 px-4 py-4 text-left transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Challenge</p>
            <p className="mt-2 text-base font-semibold text-ink">제일 흔들리기 쉬운 것</p>
            <p className="mt-1 text-sm text-muted">{challengeInput}</p>
          </button>

          <button
            type="button"
            onClick={() => openProfileModal(0)}
            className="rounded-[22px] border border-line/80 bg-white/75 px-4 py-4 text-left transition hover:-translate-y-0.5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Pace</p>
            <p className="mt-2 text-base font-semibold text-ink">다이어트 페이스</p>
            <p className="mt-1 text-sm text-muted">{paceInput}</p>
          </button>

          <button
            type="button"
            onClick={() => openProfileModal(0)}
            className="rounded-[22px] border border-line/80 bg-white/75 px-4 py-4 text-left transition hover:-translate-y-0.5 md:col-span-2"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Coach tone</p>
            <p className="mt-2 text-base font-semibold text-ink">AI 피드백 톤</p>
            <p className="mt-1 text-sm text-muted">{coachToneInput}</p>
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="customDailyTargetInput">
              목표 칼로리 직접 조정
            </label>
            <Input
              id="customDailyTargetInput"
              type="number"
              value={customDailyTargetInput}
              onChange={(event) => setCustomDailyTargetInput(event.target.value)}
              placeholder="비워두면 자동 계산"
            />
          </div>
        </div>

        <div className="mt-4 rounded-[20px] border border-line/80 bg-white/75 px-4 py-4">
          <p className="text-sm font-semibold text-ink">현재 적용될 목표 칼로리</p>
          <p className="mt-2 text-2xl font-black text-ink">{calculatedTargetCalories} kcal</p>
          <p className="mt-2 text-xs leading-6 text-muted">
            직접 입력을 비워두면 현재 몸무게, 목표 몸무게, 목표 날짜를 바탕으로 자동 계산돼요.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button onClick={() => openProfileModal(0)}>다시 설정하기</Button>
          <Button variant="secondary" onClick={handleSaveProfileSettings}>목표 칼로리 저장</Button>
          {profileSaveMessage ? <p className="text-xs text-muted">{profileSaveMessage}</p> : null}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Account
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">로그인</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          로그인하면 나중에 여러 기기에서 기록을 이어보는 흐름으로 확장하기 쉬워져요.
        </p>
        {status === "authenticated" ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-[20px] border border-line/80 bg-white/75 px-4 py-3">
              <p className="text-sm font-semibold text-ink">
                {session.user?.name ?? "로그인된 사용자"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {session.user?.email ?? "소셜 계정으로 연결됨"}
              </p>
            </div>
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => signOut({ callbackUrl: "/report" })}
            >
              로그아웃
            </Button>
          </div>
        ) : (
          <>
            {availableProviders.length > 0 ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {availableProviders.includes("google") ? (
                    <Button
                      variant="secondary"
                      className="justify-center"
                      onClick={() => signIn("google", { callbackUrl: "/report" })}
                    >
                      Google 로그인
                    </Button>
                  ) : null}
                  {availableProviders.includes("naver") ? (
                    <Button
                      variant="secondary"
                      className="justify-center"
                      onClick={() => signIn("naver", { callbackUrl: "/report" })}
                    >
                      Naver 로그인
                    </Button>
                  ) : null}
                </div>
                <p className="mt-3 text-xs text-muted">
                  연결한 로그인만 버튼으로 보여줄게요.
                </p>
              </>
            ) : (
              <div className="mt-4 rounded-[20px] border border-dashed border-line/90 bg-white/70 px-4 py-4">
                <p className="text-sm font-semibold text-ink">
                  {providerLoadFailed
                    ? "로그인 설정을 아직 불러오지 못했어요."
                    : "아직 연결된 로그인 방식이 없어요."}
                </p>
                <p className="mt-2 text-xs leading-6 text-muted">
                  {providerLoadFailed
                    ? "잠시 후 새로고침하거나 개발 서버를 다시 켜서 다시 확인해보세요."
                    : "`.env.local`에 `AUTH_SECRET`과 Google 또는 Naver 키를 넣고 서버를 다시 켜면 로그인 버튼이 나타나요."}
                </p>
              </div>
            )}
          </>
        )}
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Reset
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">기록 초기화</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          지금까지 저장한 음식, 운동, 규칙, 몸무게 기록을 모두 지울 수 있어요.
        </p>
        <div className="mt-4">
          <Button
            onClick={handleResetRecords}
            className="w-full justify-center"
            style={{
              background: "linear-gradient(135deg,#ff9c88,#ff6f61)",
              color: "#fff8f4",
            }}
          >
            기록 초기화
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
