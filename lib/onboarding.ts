import type {
  AppState,
  FeedingType,
  OnboardingData,
  OnboardingGoalMode,
  OnboardingDeliveryType,
} from "@/types/app";
import { createGuestSessionMeta } from "@/lib/guest-session";
import { getPostpartumDays, getRecoveryStage } from "@/lib/recovery-progress";

export const ONBOARDING_STORAGE_KEY = "momreset-onboarding";

export const emptyOnboardingData: OnboardingData = {
  hasCompletedOnboarding: false,
  birthDate: "",
  deliveryType: "자연분만",
  feedingType: "모유",
  postpartumStartWeightKg: "",
  currentWeightKg: "",
  targetWeightKg: "",
  goalMode: "회복 우선",
};

export function loadOnboardingData(): OnboardingData {
  if (typeof window === "undefined") {
    return emptyOnboardingData;
  }

  const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) {
    return emptyOnboardingData;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingData>;
    return {
      ...emptyOnboardingData,
      ...parsed,
      hasCompletedOnboarding: Boolean(parsed.hasCompletedOnboarding),
    };
  } catch {
    return emptyOnboardingData;
  }
}

export function saveOnboardingData(data: OnboardingData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
}

export function clearOnboardingData() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function getPostpartumDayFromBirthDate(birthDate: string) {
  return getPostpartumDays(birthDate);
}

export function getRecoveryStageLabel(postpartumDay: number) {
  return getRecoveryStage(postpartumDay);
}

function mapFeedingType(feedingType: OnboardingData["feedingType"]): FeedingType {
  switch (feedingType) {
    case "모유":
      return "breastfeeding";
    case "혼합":
      return "mixed";
    default:
      return "formula";
  }
}

function mapDeliveryType(deliveryType: OnboardingDeliveryType) {
  return deliveryType === "제왕절개" ? "c-section" : "vaginal";
}

function toOptionalNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function toRequiredNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function createAppStateFromOnboarding(
  onboardingData: OnboardingData,
  fallbackState: AppState,
): AppState {
  const postpartumDay = getPostpartumDayFromBirthDate(onboardingData.birthDate);
  const currentWeightKg = toRequiredNumber(
    onboardingData.currentWeightKg,
    fallbackState.profile.currentWeightKg,
  );
  const targetWeightKg = toRequiredNumber(
    onboardingData.targetWeightKg,
    fallbackState.profile.targetWeightKg,
  );
  const postpartumStartWeightKg = toOptionalNumber(onboardingData.postpartumStartWeightKg);
  const guestSessionMeta = createGuestSessionMeta();

  return {
    ...fallbackState,
    today: new Date().toISOString(),
    profile: {
      ...fallbackState.profile,
      birthDate: onboardingData.birthDate,
      deliveryType: mapDeliveryType(onboardingData.deliveryType),
      postpartumDay,
      postpartumStartWeightKg,
      currentWeightKg,
      targetWeightKg,
      feedingType: mapFeedingType(onboardingData.feedingType),
      goalMode: onboardingData.goalMode as OnboardingGoalMode,
    },
    checkIns: [],
    weightLogs: [],
    meals: [],
    ui: {
      lastDailyPopupDismissedDate: undefined,
      authMode: fallbackState.ui.authMode ?? guestSessionMeta.authMode,
      guestSessionId: fallbackState.ui.guestSessionId ?? guestSessionMeta.guestSessionId,
      guestSessionStartedAt:
        fallbackState.ui.guestSessionStartedAt ?? guestSessionMeta.guestSessionStartedAt,
      notificationsEnabled: fallbackState.ui.notificationsEnabled ?? true,
      darkModeEnabled: fallbackState.ui.darkModeEnabled ?? false,
      todayExercisePlanStatus: undefined,
    },
  };
}
