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
  loadBodyWeightKg,
  loadOnboardingProfile,
  loadWeightHistory,
  resetDietAppStorage,
  saveBodyWeightKg,
  saveOnboardingProfile,
  saveWeightHistory,
} from "@/lib/diet-app-storage";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import type { OnboardingProfile, WeightLogItem } from "@/types/diet-app";

type WeightRange = 7 | 30 | 90;

const rangeOptions: WeightRange[] = [7, 30, 90];
const challengeOptions: OnboardingProfile["challenge"][] = [
  "야식",
  "단음식",
  "배달음식",
  "불규칙한 식사",
];
const paceOptions: OnboardingProfile["pace"][] = ["가볍게", "꾸준하게", "집중해서"];
const coachToneOptions: OnboardingProfile["coachTone"][] = ["다정하게", "솔직하게", "발랄하게"];

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
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

      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Goal settings
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">목표와 방식 다시 정하기</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          온보딩 때 정한 목표 몸무게, 날짜, 진행 방식, 목표 칼로리를 나중에도 바꿀 수 있어요.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="goalWeightKgInput">
              목표 몸무게
            </label>
            <Input
              id="goalWeightKgInput"
              type="number"
              value={goalWeightKgInput}
              onChange={(event) => setGoalWeightKgInput(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="targetDateInput">
              목표 날짜
            </label>
            <Input
              id="targetDateInput"
              type="date"
              value={targetDateInput}
              onChange={(event) => setTargetDateInput(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">제일 흔들리기 쉬운 것</label>
            <div className="flex flex-wrap gap-2">
              {challengeOptions.map((option) => (
                <Button
                  key={option}
                  variant={challengeInput === option ? "primary" : "secondary"}
                  onClick={() => setChallengeInput(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">다이어트 페이스</label>
            <div className="flex flex-wrap gap-2">
              {paceOptions.map((option) => (
                <Button
                  key={option}
                  variant={paceInput === option ? "primary" : "secondary"}
                  onClick={() => setPaceInput(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">AI 피드백 톤</label>
            <div className="flex flex-wrap gap-2">
              {coachToneOptions.map((option) => (
                <Button
                  key={option}
                  variant={coachToneInput === option ? "primary" : "secondary"}
                  onClick={() => setCoachToneInput(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

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
          <Button onClick={handleSaveProfileSettings}>목표 설정 저장</Button>
          {profileSaveMessage ? <p className="text-xs text-muted">{profileSaveMessage}</p> : null}
        </div>
      </Card>

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
        <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
          <p>몸무게는 하루에도 조금씩 달라질 수 있어요.</p>
          <p>며칠 단위로 천천히 보면 변화를 더 잘 읽을 수 있어요.</p>
          <p>비슷한 시간대에 기록하면 흐름이 더 잘 보여요.</p>
        </div>
      </Card>

      <Card className="bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(252,253,252,0.94))]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          AI coach
        </p>
        <h2 className="mt-2 text-xl font-semibold text-ink">주간 피드백</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          몸무게는 수분량이나 식사 시간에 따라서도 조금 달라질 수 있어요. 너무 하루 숫자에만
          집중하지 말고, 며칠 흐름을 함께 봐주세요.
        </p>
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
