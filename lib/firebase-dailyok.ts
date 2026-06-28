import { calculateDailyTargetCalories } from "@/lib/diet-app-calorie-target";
import type {
  DietAppSnapshot,
  OnboardingProfile,
  RuleItem,
} from "@/types/diet-app";
import { getSmileLevelForDay } from "@/lib/smile-score";
import {
  buildWeeklyInsightSummary,
  generateRuleBasedWeeklyFeedback,
  type WeeklyAiFeedback,
  type WeeklyInsightSummary,
} from "@/lib/weekly-feedback";

export function getAccountKey(email?: string | null) {
  return email?.trim().toLowerCase() ?? null;
}

export function emptySnapshot(): DietAppSnapshot {
  return {
    foodList: [],
    doRules: [],
    avoidRules: [],
    exerciseLogs: [],
    bodyWeightKg: 55,
    weightHistory: [],
    ruleHistory: [],
    onboardingProfile: null,
  };
}

export function hasAnySnapshotData(snapshot: DietAppSnapshot) {
  return Boolean(
    snapshot.foodList.length ||
      snapshot.doRules.length ||
      snapshot.avoidRules.length ||
      snapshot.exerciseLogs.length ||
      snapshot.weightHistory.length ||
      snapshot.ruleHistory.length ||
      snapshot.onboardingProfile,
  );
}

export function normalizeSnapshot(payload: unknown): DietAppSnapshot {
  const snapshot = payload as Partial<DietAppSnapshot> | null;

  return {
    foodList: Array.isArray(snapshot?.foodList) ? snapshot.foodList : [],
    doRules: Array.isArray(snapshot?.doRules) ? snapshot.doRules : [],
    avoidRules: Array.isArray(snapshot?.avoidRules) ? snapshot.avoidRules : [],
    exerciseLogs: Array.isArray(snapshot?.exerciseLogs) ? snapshot.exerciseLogs : [],
    bodyWeightKg: typeof snapshot?.bodyWeightKg === "number" ? snapshot.bodyWeightKg : 55,
    weightHistory: Array.isArray(snapshot?.weightHistory) ? snapshot.weightHistory : [],
    ruleHistory: Array.isArray(snapshot?.ruleHistory) ? snapshot.ruleHistory : [],
    onboardingProfile: snapshot?.onboardingProfile ?? null,
  };
}

export function getGoalCalories(snapshot: DietAppSnapshot, baseDate = new Date()) {
  const currentWeight =
    snapshot.bodyWeightKg || snapshot.onboardingProfile?.currentWeightKg || 55;

  return calculateDailyTargetCalories(currentWeight, snapshot.onboardingProfile, baseDate);
}

export function buildWidgetSummary(snapshot: DietAppSnapshot, baseDate = new Date()) {
  const today = baseDate.toISOString().slice(0, 10);
  const todayFoods = snapshot.foodList.filter((item) => item.loggedAt === today);
  const todayExercises = snapshot.exerciseLogs.filter((item) => item.loggedAt === today);
  const todayHistory = snapshot.ruleHistory.find((item) => item.date === today);
  const intakeCalories = todayFoods.reduce((sum, item) => sum + item.calories, 0);
  const exerciseCalories = todayExercises.reduce((sum, item) => sum + item.burnedCalories, 0);
  const targetCalories = getGoalCalories(snapshot, baseDate);
  const doDoneCount = Object.values(todayHistory?.doRuleStatuses ?? {}).filter(
    (status) => status === "done",
  ).length;
  const doFailedCount = Object.values(todayHistory?.doRuleStatuses ?? {}).filter(
    (status) => status === "failed",
  ).length;
  const avoidDoneCount = Object.values(todayHistory?.avoidRuleStatuses ?? {}).filter(
    (status) => status === "done",
  ).length;
  const avoidFailedCount = Object.values(todayHistory?.avoidRuleStatuses ?? {}).filter(
    (status) => status === "failed",
  ).length;
  const failedCount = doFailedCount + avoidFailedCount;

  return {
    date: today,
    intakeCalories,
    exerciseCalories,
    netCalories: intakeCalories - exerciseCalories,
    targetCalories,
    doDoneCount,
    doTotalCount: snapshot.doRules.length,
    avoidDoneCount,
    avoidTotalCount: snapshot.avoidRules.length,
    smileLevel: getSmileLevelForDay(
      intakeCalories - exerciseCalories,
      todayFoods.length > 0,
      doDoneCount + avoidDoneCount,
      failedCount,
      targetCalories,
    ),
    updatedAt: new Date().toISOString(),
  };
}

export function buildWeeklyFeedbackFromSnapshot(snapshot: DietAppSnapshot, baseDate = new Date()) : {
  weekKey: string;
  summary: WeeklyInsightSummary;
  feedback: WeeklyAiFeedback;
} {
  const goalCalories = getGoalCalories(snapshot, baseDate);
  const summary = buildWeeklyInsightSummary({
    foods: snapshot.foodList,
    exerciseLogs: snapshot.exerciseLogs,
    ruleHistory: snapshot.ruleHistory,
    doRules: snapshot.doRules,
    avoidRules: snapshot.avoidRules,
    weightHistory: snapshot.weightHistory,
    profile: snapshot.onboardingProfile,
    goalCalories,
    baseDate,
  });

  return {
    weekKey: `${summary.startDate}_${summary.endDate}`,
    summary,
    feedback: generateRuleBasedWeeklyFeedback(summary),
  };
}

export function buildProfileDocument(params: {
  accountKey: string;
  displayName?: string | null;
  snapshot: DietAppSnapshot;
}) {
  const profile = params.snapshot.onboardingProfile;

  if (!profile) {
    return null;
  }

  return {
    accountKey: params.accountKey,
    displayName: params.displayName ?? null,
    email: params.accountKey,
    challenge: profile.challenge,
    pace: profile.pace,
    coachTone: profile.coachTone,
    currentWeightKg: params.snapshot.bodyWeightKg ?? profile.currentWeightKg,
    goalWeightKg: profile.goalWeightKg,
    targetDate: profile.targetDate,
    customDailyTargetCalories: profile.customDailyTargetCalories ?? null,
    completedAt: profile.completedAt,
    updatedAt: new Date().toISOString(),
  };
}

export function hydrateOnboardingProfile(
  profileData: Record<string, unknown> | undefined,
): OnboardingProfile | null {
  if (!profileData) {
    return null;
  }

  return {
    completedAt: String(profileData.completedAt ?? new Date().toISOString()),
    challenge: (profileData.challenge as OnboardingProfile["challenge"]) ?? "야식",
    pace: (profileData.pace as OnboardingProfile["pace"]) ?? "꾸준하게",
    coachTone: (profileData.coachTone as OnboardingProfile["coachTone"]) ?? "발랄하게",
    currentWeightKg: Number(profileData.currentWeightKg ?? 55),
    goalWeightKg: Number(profileData.goalWeightKg ?? 50),
    targetDate: String(profileData.targetDate ?? new Date().toISOString().slice(0, 10)),
    customDailyTargetCalories:
      typeof profileData.customDailyTargetCalories === "number"
        ? profileData.customDailyTargetCalories
        : undefined,
  };
}

export function toRuleItem(
  id: string,
  data: Record<string, unknown>,
): RuleItem {
  return {
    id,
    title: String(data.title ?? ""),
    status: "pending",
  };
}
