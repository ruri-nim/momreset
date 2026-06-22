import { getLocalDateKey } from "@/lib/diet-app-date";
import type {
  DietAppSnapshot,
  DietFoodItem,
  ExerciseLogItem,
  OnboardingProfile,
  RuleHistoryEntry,
  RuleItem,
  WeightLogItem,
} from "@/types/diet-app";

export const DAILYOK_LOCAL_EVENT = "dailyok:local-changed";

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

let syncTimer: ReturnType<typeof setTimeout> | null = null;

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

function readSnapshotFromStorage(): DietAppSnapshot {
  return {
    foodList: readStorage<DietFoodItem[]>(DIET_APP_STORAGE_KEYS.foodList, []),
    doRules: readStorage<RuleItem[]>(DIET_APP_STORAGE_KEYS.doRules, []),
    avoidRules: readStorage<RuleItem[]>(DIET_APP_STORAGE_KEYS.avoidRules, []),
    exerciseLogs: readStorage<ExerciseLogItem[]>(DIET_APP_STORAGE_KEYS.exerciseLogs, []),
    bodyWeightKg: readStorage<number>(DIET_APP_STORAGE_KEYS.bodyWeightKg, 55),
    weightHistory: readStorage<WeightLogItem[]>(DIET_APP_STORAGE_KEYS.weightHistory, []),
    ruleHistory: readStorage<RuleHistoryEntry[]>(DIET_APP_STORAGE_KEYS.ruleHistory, []),
    onboardingProfile: readStorage<OnboardingProfile | null>(
      DIET_APP_STORAGE_KEYS.onboardingProfile,
      null,
    ),
  };
}

function queueServerSync() {
  if (typeof window === "undefined") {
    return;
  }

  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(() => {
    fetch("/api/dailyok/snapshot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(readSnapshotFromStorage()),
    }).catch(() => {
      // Guests or offline users can keep using local storage without interruption.
    });
  }, 300);
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(DAILYOK_LOCAL_EVENT));
  queueServerSync();
}

export function notifyDailyOkChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(DAILYOK_LOCAL_EVENT));
}

export function loadFoodList() {
  return readStorage<DietFoodItem[]>(DIET_APP_STORAGE_KEYS.foodList, []).map((item) => ({
    ...item,
    loggedAt: item.loggedAt ?? getLocalDateKey(),
  }));
}

export function saveFoodList(items: DietFoodItem[]) {
  writeStorage(DIET_APP_STORAGE_KEYS.foodList, items);
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
  window.dispatchEvent(new CustomEvent(DAILYOK_LOCAL_EVENT));
  queueServerSync();
}
