"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLocalDateKey } from "@/lib/diet-app-date";
import {
  loadOnboardingProfile,
  loadWeightHistory,
  saveBodyWeightKg,
  saveAvoidRules,
  saveDoRules,
  saveOnboardingProfile,
  saveWeightHistory,
} from "@/lib/diet-app-storage";
import type { OnboardingProfile, RuleItem, WeightLogItem } from "@/types/diet-app";

const challengeOptions: OnboardingProfile["challenge"][] = [
  "야식",
  "단음식",
  "배달음식",
  "불규칙한 식사",
];

const paceOptions: OnboardingProfile["pace"][] = ["가볍게", "꾸준하게", "집중해서"];
const coachToneOptions: OnboardingProfile["coachTone"][] = ["다정하게", "솔직하게", "발랄하게"];
const suggestedDoRules = [
  "점심 후 15분 걷기",
  "하루 물 2L 마시기",
  "저녁에 단백질 1회 꼭 챙기기",
];
const suggestedAvoidRules = [
  "밤 7시 이후 야식 먹지 않기",
  "달달한 음료 먹지 않기",
  "디저트 먹지 않기",
  "배달음식 먹지 않기",
];

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

export function OnboardingGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [step, setStep] = useState(0);
  const [challenge, setChallenge] = useState<OnboardingProfile["challenge"]>("야식");
  const [pace, setPace] = useState<OnboardingProfile["pace"]>("꾸준하게");
  const [coachTone, setCoachTone] = useState<OnboardingProfile["coachTone"]>("발랄하게");
  const [currentWeightKg, setCurrentWeightKg] = useState("55");
  const [goalWeightKg, setGoalWeightKg] = useState("50");
  const [targetDate, setTargetDate] = useState("");
  const [doRules, setDoRules] = useState<RuleItem[]>([]);
  const [avoidRules, setAvoidRules] = useState<RuleItem[]>([]);
  const [doInput, setDoInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");

  useEffect(() => {
    const savedProfile = loadOnboardingProfile();

    if (savedProfile) {
      setCompleted(true);
    } else {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 2);
      setTargetDate(getLocalDateKey(nextMonth));
    }

    setReady(true);
  }, []);

  const handleFinish = () => {
    const currentWeight = Number(currentWeightKg);
    const goalWeight = Number(goalWeightKg);

    if (!currentWeight || !goalWeight || !targetDate) {
      window.alert("몸무게와 목표 날짜를 먼저 적어주세요.");
      return;
    }

    const profile: OnboardingProfile = {
      completedAt: new Date().toISOString(),
      challenge,
      pace,
      coachTone,
      currentWeightKg: currentWeight,
      goalWeightKg: goalWeight,
      targetDate,
    };

    const todayKey = getLocalDateKey();
    const currentHistory = loadWeightHistory();
    const todayWeight: WeightLogItem = {
      id: crypto.randomUUID(),
      date: todayKey,
      weightKg: currentWeight,
    };
    const nextHistory =
      currentHistory[0]?.date === todayKey
        ? [{ ...currentHistory[0], weightKg: currentWeight }, ...currentHistory.slice(1)]
        : [todayWeight, ...currentHistory];

    saveOnboardingProfile(profile);
    saveBodyWeightKg(currentWeight);
    saveWeightHistory(nextHistory);
    saveDoRules(doRules);
    saveAvoidRules(avoidRules);
    window.location.reload();
  };

  const addRuleItem = (
    type: "do" | "avoid",
    title: string,
  ) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const nextRule: RuleItem = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      status: "pending",
    };

    if (type === "do") {
      setDoRules((prev) =>
        prev.some((item) => item.title === trimmedTitle) ? prev : [...prev, nextRule],
      );
      return;
    }

    setAvoidRules((prev) =>
      prev.some((item) => item.title === trimmedTitle) ? prev : [...prev, nextRule],
    );
  };

  const removeRuleItem = (type: "do" | "avoid", id: string) => {
    if (type === "do") {
      setDoRules((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    setAvoidRules((prev) => prev.filter((item) => item.id !== id));
  };

  if (!ready) {
    return null;
  }

  return (
    <>
      {children}
      {!completed ? (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto px-4 py-8"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,247,173,0.94) 0%, rgba(255,239,173,0.97) 42%, rgba(255,223,188,0.96) 100%)",
          }}
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
                  <p className="text-2xl">🍋✨</p>
                </div>
                <div className="mt-4 flex gap-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="h-2 flex-1 rounded-full"
                      style={{
                        background:
                          index <= step
                            ? "linear-gradient(90deg,#ffd54f,#ffb74d)"
                            : "rgba(223, 197, 174, 0.5)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {step === 0 ? (
                <div className="space-y-5 px-6 py-6">
                  <div className="rounded-[28px] border border-line/80 bg-[#fff8ea] px-5 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                      Hello!
                    </p>
                    <h1 className="mt-3 text-3xl font-black leading-tight text-ink">
                      오늘의 OK를
                      <br />
                      귀엽게 모아봐요
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      칼로리, 운동, 해야 할 일, 피해야 할 일을 가볍게 체크하면서
                      오늘 흐름을 스티커처럼 볼 수 있어요.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-[22px] border border-line/80 bg-white/75 px-3 py-4">
                      <p className="text-2xl">😎</p>
                      <p className="mt-2 text-xs font-semibold text-muted">잘한 하루</p>
                    </div>
                    <div className="rounded-[22px] border border-line/80 bg-white/75 px-3 py-4">
                      <p className="text-2xl">🍓</p>
                      <p className="mt-2 text-xs font-semibold text-muted">가벼운 기록</p>
                    </div>
                    <div className="rounded-[22px] border border-line/80 bg-white/75 px-3 py-4">
                      <p className="text-2xl">🫧</p>
                      <p className="mt-2 text-xs font-semibold text-muted">부담 없는 흐름</p>
                    </div>
                  </div>

                  <Button className="w-full justify-center" onClick={() => setStep(1)}>
                    시작하기
                  </Button>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-5 px-6 py-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                      Tiny survey
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-ink">내 리듬을 먼저 알려줘요</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      정답은 없어요. 지금 나한테 제일 가까운 걸 고르면 돼요.
                    </p>
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-semibold text-ink">제일 흔들리기 쉬운 건?</p>
                    <div className="flex flex-wrap gap-2">
                      {challengeOptions.map((option) => (
                        <ChoiceChip
                          key={option}
                          label={option}
                          selected={challenge === option}
                          onClick={() => setChallenge(option)}
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
                          selected={pace === option}
                          onClick={() => setPace(option)}
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
                          selected={coachTone === option}
                          onClick={() => setCoachTone(option)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1 justify-center" onClick={() => setStep(0)}>
                      이전
                    </Button>
                    <Button className="flex-1 justify-center" onClick={() => setStep(2)}>
                      다음
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5 px-6 py-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                      Goal setup
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-ink">목표를 가볍게 적어봐요</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      오늘 기준 몸무게와, 가고 싶은 목표만 적으면 출발 준비 끝이에요.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="currentWeightKg">
                        현재 몸무게
                      </label>
                      <Input
                        id="currentWeightKg"
                        type="number"
                        value={currentWeightKg}
                        onChange={(event) => setCurrentWeightKg(event.target.value)}
                        placeholder="예: 55"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="goalWeightKg">
                        목표 몸무게
                      </label>
                      <Input
                        id="goalWeightKg"
                        type="number"
                        value={goalWeightKg}
                        onChange={(event) => setGoalWeightKg(event.target.value)}
                        placeholder="예: 50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="targetDate">
                        목표 일정
                      </label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={targetDate}
                        onChange={(event) => setTargetDate(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-line/80 bg-white/75 px-4 py-4">
                    <p className="text-sm font-semibold text-ink">한 줄 요약</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {currentWeightKg}kg에서 {goalWeightKg}kg까지, {targetDate || "날짜 미정"} 목표예요.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1 justify-center" onClick={() => setStep(1)}>
                      이전
                    </Button>
                    <Button className="flex-1 justify-center" onClick={() => setStep(3)}>
                      다음
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-5 px-6 py-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                      Rule setup
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-ink">이번 주 규칙도 골라봐요</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      추천 규칙을 톡 눌러 담거나, 내 방식대로 직접 적어도 돼요.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-line/80 bg-white/75 px-4 py-4">
                    <p className="text-sm font-semibold text-ink">해야 할 일 추천</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestedDoRules.map((rule) => (
                        <ChoiceChip
                          key={rule}
                          label={rule}
                          selected={doRules.some((item) => item.title === rule)}
                          onClick={() => addRuleItem("do", rule)}
                        />
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Input
                        value={doInput}
                        onChange={(event) => setDoInput(event.target.value)}
                        placeholder="예: 저녁 먹고 산책 10분"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          addRuleItem("do", doInput);
                          setDoInput("");
                        }}
                      >
                        추가
                      </Button>
                    </div>
                    {doRules.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {doRules.map((rule) => (
                          <button
                            key={rule.id}
                            type="button"
                            onClick={() => removeRuleItem("do", rule.id)}
                            className="rounded-full border px-3 py-2 text-xs font-semibold"
                            style={{
                              borderColor: "rgba(255, 140, 102, 0.45)",
                              background: "rgba(255, 224, 102, 0.24)",
                              color: "rgb(var(--color-ink))",
                            }}
                          >
                            {rule.title} x
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[24px] border border-line/80 bg-white/75 px-4 py-4">
                    <p className="text-sm font-semibold text-ink">피해야 할 일 추천</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestedAvoidRules.map((rule) => (
                        <ChoiceChip
                          key={rule}
                          label={rule}
                          selected={avoidRules.some((item) => item.title === rule)}
                          onClick={() => addRuleItem("avoid", rule)}
                        />
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Input
                        value={avoidInput}
                        onChange={(event) => setAvoidInput(event.target.value)}
                        placeholder="예: 밤에 과자 먹지 않기"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          addRuleItem("avoid", avoidInput);
                          setAvoidInput("");
                        }}
                      >
                        추가
                      </Button>
                    </div>
                    {avoidRules.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {avoidRules.map((rule) => (
                          <button
                            key={rule.id}
                            type="button"
                            onClick={() => removeRuleItem("avoid", rule.id)}
                            className="rounded-full border px-3 py-2 text-xs font-semibold"
                            style={{
                              borderColor: "rgba(255, 111, 97, 0.4)",
                              background: "rgba(255, 138, 128, 0.18)",
                              color: "rgb(var(--color-ink))",
                            }}
                          >
                            {rule.title} x
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1 justify-center" onClick={() => setStep(2)}>
                      이전
                    </Button>
                    <Button className="flex-1 justify-center" onClick={handleFinish}>
                      시작 완료
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
