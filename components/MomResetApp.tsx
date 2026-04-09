"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, FileText, Home, UserRound, Utensils } from "lucide-react";
import DailyRecoveryCheckinModal, {
  type DailyRecoveryFormState,
} from "@/components/checkin/DailyRecoveryCheckinModal";
import DailyWeightCheckinModal from "@/components/checkin/DailyWeightCheckinModal";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import HomeTab from "@/components/tabs/HomeTab";
import ExerciseTab from "@/components/tabs/ExerciseTab";
import FoodTab from "@/components/tabs/FoodTab";
import MyTab from "@/components/tabs/MyTab";
import ReportTab from "@/components/tabs/ReportTab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  createRecoveryLogFromForm,
  createWeightLog,
  getPhaseForDailyCheckin,
  getTodayDateKey,
  markDailyPopupDismissed,
  shouldShowDailyPopup,
} from "@/lib/daily-checkin";
import { initialAppState } from "@/lib/mock-data";
import {
  clearOnboardingData,
  createAppStateFromOnboarding,
  emptyOnboardingData,
  loadOnboardingData,
  saveOnboardingData,
} from "@/lib/onboarding";
import { createGuestSessionMeta, ensureGuestSession } from "@/lib/guest-session";
import { getAppPhase } from "@/lib/phase";
import { APP_STORAGE_KEY, loadAppState, saveAppState } from "@/lib/storage";
import type { AppState, AppTab, OnboardingData } from "@/types/app";
import type { MealRecord } from "@/types/food";

const tabs: Array<{ id: AppTab; label: string }> = [
  { id: "home", label: "Home" },
  { id: "exercise", label: "Exercise" },
  { id: "food", label: "Food" },
  { id: "report", label: "Report" },
  { id: "my", label: "My" },
];

const tabIcons: Record<AppTab, typeof Home> = {
  home: Home,
  exercise: Dumbbell,
  food: Utensils,
  report: FileText,
  my: UserRound,
};

export default function MomResetApp() {
  const [tab, setTab] = useState<AppTab>("home");
  const [state, setState] = useState<AppState>(initialAppState);
  const [onboarding, setOnboarding] = useState<OnboardingData>(emptyOnboardingData);
  const [showDailyPopup, setShowDailyPopup] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState<DailyRecoveryFormState>({
    sleep: "4-6h",
    hydration: "4-5컵",
    pain: "4-6",
    bleeding: "적음",
    exercise: "10분",
    nutrition: "보통",
    feeding: "혼합",
    scarDiscomfort: "약간",
    abdominalPressure: "약간",
    pelvicFloorDiscomfort: "약간",
    weightKg: "",
  });
  const [weightValue, setWeightValue] = useState("");

  useEffect(() => {
    setOnboarding(loadOnboardingData());
    setState(ensureGuestSession(loadAppState()));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveAppState(state);
  }, [isReady, state]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveOnboardingData(onboarding);
  }, [isReady, onboarding]);

  useEffect(() => {
    if (!isReady || !onboarding.hasCompletedOnboarding) {
      setShowDailyPopup(false);
      return;
    }

    if (getPhaseForDailyCheckin(state.profile.postpartumDay) === "reset") {
      setWeightValue(state.profile.currentWeightKg ? String(state.profile.currentWeightKg) : "");
    }

    setShowDailyPopup(shouldShowDailyPopup(state));
  }, [isReady, onboarding.hasCompletedOnboarding, state]);

  const phase = getAppPhase(state.profile.postpartumDay);
  const isDarkMode = state.ui.darkModeEnabled ?? false;
  const title = useMemo(() => {
    if (phase === "recovery") {
      return "회복의 리듬을 차분하게 확인해볼까요";
    }
    return "몸을 무리 없이 다시 정돈하는 흐름이에요";
  }, [phase]);

  function handleAddMeal(meal: MealRecord) {
    setState((current) => ({
      ...current,
      meals: [meal, ...current.meals],
    }));
  }

  function handleOnboardingChange(patch: Partial<OnboardingData>) {
    setOnboarding((current) => ({
      ...current,
      ...patch,
    }));
  }

  function handleOnboardingComplete() {
    const completed = {
      ...onboarding,
      hasCompletedOnboarding: true,
    };

    const nextState = createAppStateFromOnboarding(completed, state);
    setOnboarding(completed);
    setState(nextState);
    saveOnboardingData(completed);
    saveAppState(nextState);
  }

  function handleDailyPopupLater() {
    const nextState = markDailyPopupDismissed(state);
    setState(nextState);
    setShowDailyPopup(false);
  }

  function handleResetDevelopmentState() {
    clearOnboardingData();
    window.localStorage.removeItem(APP_STORAGE_KEY);
    window.location.reload();
  }

  function handleClearDailyDismissal() {
    const nextState = {
      ...state,
      ui: {
        ...state.ui,
        lastDailyPopupDismissedDate: undefined,
      },
    };
    setState(nextState);
  }

  function handleAuthModeChange(mode: "guest" | "google" | "kakao") {
    const guestSessionMeta = createGuestSessionMeta();

    setState((current) => ({
      ...current,
      ui: {
        ...current.ui,
        authMode: mode,
        ...(mode === "guest"
          ? {
              guestSessionId: current.ui.guestSessionId ?? guestSessionMeta.guestSessionId,
              guestSessionStartedAt:
                current.ui.guestSessionStartedAt ?? guestSessionMeta.guestSessionStartedAt,
            }
          : {}),
      },
    }));
  }

  function handleToggleNotifications() {
    setState((current) => ({
      ...current,
      ui: {
        ...current.ui,
        notificationsEnabled: !(current.ui.notificationsEnabled ?? true),
      },
    }));
  }

  function handleToggleDarkMode() {
    setState((current) => ({
      ...current,
      ui: {
        ...current.ui,
        darkModeEnabled: !(current.ui.darkModeEnabled ?? false),
      },
    }));
  }

  function handleSetTodayExercisePlanStatus(status: "done" | "rest") {
    setState((current) => ({
      ...current,
      ui: {
        ...current.ui,
        todayExercisePlanStatus: status,
      },
    }));
  }

  function handleSaveRecoveryCheckin() {
    const nextLog = createRecoveryLogFromForm(recoveryForm, state.profile.postpartumDay);
    const nextWeightLogs = nextLog.weightKg
      ? [
          ...state.weightLogs.filter((weightLog) => weightLog.dateKey !== nextLog.dateKey),
          createWeightLog(nextLog.weightKg),
        ]
      : state.weightLogs;
    const nextState = markDailyPopupDismissed({
      ...state,
      profile: {
        ...state.profile,
        feedingType: nextLog.feedingType,
        currentWeightKg: nextLog.weightKg ?? state.profile.currentWeightKg,
      },
      checkIns: [
        ...state.checkIns.filter((checkIn) => checkIn.dateKey !== nextLog.dateKey),
        nextLog,
      ],
      weightLogs: nextWeightLogs,
    });

    setState(nextState);
    setShowDailyPopup(false);
  }

  function handleSaveWeightCheckin() {
    const parsed = Number(weightValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }

    const nextLog = createWeightLog(parsed);
    const nextState = markDailyPopupDismissed({
      ...state,
      profile: {
        ...state.profile,
        currentWeightKg: parsed,
      },
      weightLogs: [
        ...state.weightLogs.filter((weightLog) => weightLog.dateKey !== nextLog.dateKey),
        nextLog,
      ],
    });

    setState(nextState);
    setShowDailyPopup(false);
  }

  if (!isReady) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#d1fae5",
        }}
      >
        <p>MomReset을 준비하고 있어요...</p>
      </main>
    );
  }

  if (!onboarding.hasCompletedOnboarding) {
    return (
      <OnboardingFlow
        data={onboarding}
        onChange={handleOnboardingChange}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  const dailyPhase = getPhaseForDailyCheckin(state.profile.postpartumDay);

  return (
    <>
      <main
        data-theme={isDarkMode ? "dark" : "light"}
        className="min-h-screen px-2 py-2 text-slate-900 sm:px-4 sm:py-4"
        style={{
          background: "var(--app-background)",
          color: "rgb(var(--color-ink))",
        }}
      >
        <div className="mx-auto max-w-[430px]" style={{ position: "relative" }}>
          <div
            style={{
              position: "relative",
              height: "calc(100vh - 16px)",
              borderRadius: 34,
              border: "1px solid var(--shell-border)",
              background: "var(--shell-background)",
              boxShadow: isDarkMode
                ? "0 24px 80px rgba(0, 0, 0, 0.46)"
                : "0 24px 80px rgba(122, 146, 166, 0.16)",
              overflow: "hidden",
            }}
          >
            <div
              className="px-3 pt-3 sm:px-4 sm:pt-4"
              style={{
                height: "100%",
                overflowY: "auto",
                paddingBottom: 120,
              }}
            >
              <section
                style={{
                  padding: 8,
                }}
              >
                <div className="space-y-3">
                  <div>
                    <Badge
                      style={{
                        backgroundColor: "rgb(var(--color-sage) / 0.9)",
                        color: "rgb(var(--color-coral))",
                      }}
                    >
                      {phase === "recovery" ? "Recovery Phase" : "Reset Phase"}
                    </Badge>
                    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                      MomReset
                    </h1>
                    <p className="mt-2 text-base leading-7 text-muted">{state.profile.name}님, {title}</p>
                    <p className="mt-1 text-sm text-muted" style={{ color: "var(--text-soft)" }}>
                      산후 회복과 바디 리셋 흐름을 차분하게 확인해보세요.
                    </p>
                  </div>
                  {tab === "home" ? (
                    <div
                      style={{
                        borderRadius: 28,
                        border: "1px solid rgb(var(--color-line) / 0.88)",
                        background: "var(--card-background)",
                        boxShadow: isDarkMode
                          ? "0 18px 36px rgba(0, 0, 0, 0.24)"
                          : "0 18px 36px rgba(213, 228, 237, 0.32)",
                        padding: 20,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 18,
                            backgroundColor: "rgb(var(--color-sage) / 0.9)",
                            color: "rgb(var(--color-coral))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                          }}
                        >
                          {phase === "recovery" ? "↗" : "◎"}
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-ink">
                            {phase === "recovery" ? "오늘 회복 흐름" : "오늘 리셋 흐름"}
                          </p>
                          <p className="mt-2 text-sm leading-7" style={{ color: "var(--text-soft)" }}>
                            산후 {state.profile.postpartumDay}일차 ·{" "}
                            {state.profile.deliveryType === "c-section" ? "제왕절개" : "자연분만"} ·{" "}
                            {state.profile.feedingType === "breastfeeding"
                              ? "모유수유"
                              : state.profile.feedingType === "mixed"
                                ? "혼합수유"
                                : "분유수유"}
                          </p>
                          <p className="mt-4 text-sm leading-7" style={{ color: "var(--text-soft)" }}>
                            목표는 빠른 기록이 아니라 몸 상태를 무리 없이 이해하고 회복 리듬을 놓치지
                            않는 거예요.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              {process.env.NODE_ENV === "development" ? (
                <div
                  className="mt-3 flex items-center justify-end gap-3"
                  style={{ opacity: 0.68 }}
                >
                  <button
                    type="button"
                    onClick={handleResetDevelopmentState}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-soft)",
                    }}
                  >
                    Reset Onboarding
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDailyDismissal}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-soft)",
                    }}
                  >
                    Clear Daily Popup
                  </button>
                </div>
              ) : null}

              <div className="mt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tab === "home" ? <HomeTab state={state} /> : null}
                    {tab === "exercise" ? (
                      <ExerciseTab
                        state={state}
                        onSetTodayExercisePlanStatus={handleSetTodayExercisePlanStatus}
                      />
                    ) : null}
                    {tab === "food" ? <FoodTab state={state} onAddMeal={handleAddMeal} /> : null}
                    {tab === "report" ? <ReportTab state={state} /> : null}
                    {tab === "my" ? (
                      <MyTab
                        state={state}
                        onAuthModeChange={handleAuthModeChange}
                        onToggleNotifications={handleToggleNotifications}
                        onToggleDarkMode={handleToggleDarkMode}
                      />
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

        <nav
          style={{
            position: "fixed",
            left: "50%",
            bottom: 12,
            transform: "translateX(-50%)",
            width: "min(406px, calc(100vw - 24px))",
            borderRadius: 30,
            border: "1px solid rgb(var(--color-line) / 0.9)",
            backgroundColor: "var(--nav-background)",
            backdropFilter: "blur(18px)",
            boxShadow: isDarkMode
              ? "0 18px 30px rgba(0, 0, 0, 0.36)"
              : "0 18px 30px rgba(168, 185, 198, 0.2)",
            padding: 10,
            zIndex: 100,
          }}
        >
          <div className="grid grid-cols-5 gap-2">
            {tabs.map((item) => {
              const Icon = tabIcons[item.id];
              const active = tab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      minHeight: 62,
                      borderRadius: 20,
                      border: "none",
                      background: active ? "var(--nav-active)" : "transparent",
                      color: active ? "rgb(var(--color-coral))" : "var(--nav-icon)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                    }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>

      <DailyRecoveryCheckinModal
        open={showDailyPopup && dailyPhase === "recovery"}
        value={recoveryForm}
        onChange={setRecoveryForm}
        onSave={handleSaveRecoveryCheckin}
        onLater={handleDailyPopupLater}
      />

      <DailyWeightCheckinModal
        open={showDailyPopup && dailyPhase === "reset"}
        value={weightValue}
        onChange={setWeightValue}
        onSave={handleSaveWeightCheckin}
        onLater={handleDailyPopupLater}
      />
    </>
  );
}
