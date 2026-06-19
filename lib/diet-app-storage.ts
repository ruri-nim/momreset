import { getLocalDateKey } from "@/lib/diet-app-date";
import type {
  ExerciseLogItem,
  OnboardingProfile,
  RuleHistoryEntry,
  RuleItem,
  WeightLogItem,
} from "@/types/diet-app";

export const DIET_APP_STORAGE_KEYS = {
  foodList: "food-list",
  doRules: "diet-app:do-rules",
  avoidRules: "diet-app:avoid-rules",
  exerciseLogs: "diet-app:exercise-logs",
  bodyWeightKg: "diet-app:body-weight-kg",
  weightHistory: "diet-app:weight-history",
  ruleHistory: "diet-app:rule-history",
  onboardingProfile: "diet-app:onboarding-profile",
} as const;

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadDoRules() {
  return readStorage<RuleItem[]>(DIET_APP_STORAGE_KEYS.doRules, []);
}

export function saveDoRules(items: RuleItem[]) {
  writeStorage(DIET_APP_STORAGE_KEYS.doRules, items);
}

export function loadAvoidRules() {
  return readStorage<RuleItem[]>(DIET_APP_STORAGE_KEYS.avoidRules, []);
}

export function saveAvoidRules(items: RuleItem[]) {
  writeStorage(DIET_APP_STORAGE_KEYS.avoidRules, items);
}

export function loadRuleHistory() {
  return readStorage<RuleHistoryEntry[]>(DIET_APP_STORAGE_KEYS.ruleHistory, []).sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );
}

export function saveRuleHistory(items: RuleHistoryEntry[]) {
  writeStorage(DIET_APP_STORAGE_KEYS.ruleHistory, items);
}

export function getRuleHistoryForDate(date: string) {
  return loadRuleHistory().find((item) => item.date === date) ?? null;
}

export function saveRuleStatusesForDate(
  date: string,
  doRules: RuleItem[],
  avoidRules: RuleItem[],
) {
  const history = loadRuleHistory();
  const nextEntry: RuleHistoryEntry = {
    date,
    doRuleStatuses: Object.fromEntries(doRules.map((item) => [item.id, item.status])),
    avoidRuleStatuses: Object.fromEntries(avoidRules.map((item) => [item.id, item.status])),
  };
  const existingIndex = history.findIndex((item) => item.date === date);

  if (existingIndex >= 0) {
    const nextHistory = [...history];
    nextHistory[existingIndex] = nextEntry;
    saveRuleHistory(nextHistory);
    return;
  }

  saveRuleHistory([nextEntry, ...history]);
}

export function loadExerciseLogs() {
  const items = readStorage<ExerciseLogItem[]>(DIET_APP_STORAGE_KEYS.exerciseLogs, []);

  return items.map((item) => ({
    ...item,
    loggedAt: item.loggedAt ?? getLocalDateKey(),
  }));
}

export function saveExerciseLogs(items: ExerciseLogItem[]) {
  writeStorage(DIET_APP_STORAGE_KEYS.exerciseLogs, items);
}

export function loadBodyWeightKg() {
  return readStorage<number>(DIET_APP_STORAGE_KEYS.bodyWeightKg, 55);
}

export function saveBodyWeightKg(weightKg: number) {
  writeStorage(DIET_APP_STORAGE_KEYS.bodyWeightKg, weightKg);
}

export function loadWeightHistory() {
  return readStorage<WeightLogItem[]>(DIET_APP_STORAGE_KEYS.weightHistory, []).sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );
}

export function saveWeightHistory(items: WeightLogItem[]) {
  writeStorage(DIET_APP_STORAGE_KEYS.weightHistory, items);
}

export function loadOnboardingProfile() {
  return readStorage<OnboardingProfile | null>(DIET_APP_STORAGE_KEYS.onboardingProfile, null);
}

export function saveOnboardingProfile(profile: OnboardingProfile) {
  writeStorage(DIET_APP_STORAGE_KEYS.onboardingProfile, profile);
}

export function resetDietAppStorage() {
  if (typeof window === "undefined") {
    return;
  }

  Object.values(DIET_APP_STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });

  window.localStorage.removeItem("food-list");
}
