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
export const DAILYOK_RESET_PENDING_KEY = "dailyok:reset-pending";

export const DIET_APP_STORAGE_KEYS = {
  foodList: "food-list",
  doRules: "diet-app:do-rules",
  avoidRules: "diet-app:avoid-rules",
  exerciseLogs: "diet-app:exercise-logs",
  bodyWeightKg: "diet-app:body-weight-kg",
  weightHistory: "diet-app:weight-history",
  ruleHistory: "diet-app:rule-history",
  onboardingProfile: "diet-app:onboarding-profile",
  ruleFinalizedThrough: "diet-app:rule-finalized-through",
} as const;

let syncTimer: ReturnType<typeof setTimeout> | null = null;
let syncAbortController: AbortController | null = null;

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

  if (isDietAppResetPending()) {
    return;
  }

  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  syncTimer = setTimeout(() => {
    syncTimer = null;
    const controller = new AbortController();
    syncAbortController = controller;

    fetch("/api/dailyok/snapshot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(readSnapshotFromStorage()),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          console.warn("Daily OK server sync failed", await response.text());
          return;
        }

        const payload = (await response.json().catch(() => null)) as {
          ok?: boolean;
          enabled?: boolean;
        } | null;

        if (payload?.ok === false) {
          console.warn("Daily OK server sync disabled or rejected", payload);
        }
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.warn("Daily OK server sync skipped", error);
        // Guests or offline users can keep using local storage without interruption.
      })
      .finally(() => {
        if (syncAbortController === controller) {
          syncAbortController = null;
        }
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
  const hadAnyRules = loadDoRules().length > 0 || loadAvoidRules().length > 0;

  if (!hadAnyRules && items.length > 0) {
    initializeRuleFinalization();
  }

  writeStorage(DIET_APP_STORAGE_KEYS.doRules, items);
}

export function loadAvoidRules() {
  return readStorage<RuleItem[]>(DIET_APP_STORAGE_KEYS.avoidRules, []);
}

export function saveAvoidRules(items: RuleItem[]) {
  const hadAnyRules = loadDoRules().length > 0 || loadAvoidRules().length > 0;

  if (!hadAnyRules && items.length > 0) {
    initializeRuleFinalization();
  }

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

export function initializeRuleFinalization(date = getLocalDateKey()) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DIET_APP_STORAGE_KEYS.ruleFinalizedThrough, date);
}

function getNextDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return getLocalDateKey(date);
}

export function finalizeUnrecordedRuleDays(baseDate = new Date()) {
  if (typeof window === "undefined" || !loadOnboardingProfile()) {
    return;
  }

  const doRules = loadDoRules();
  const avoidRules = loadAvoidRules();

  if (doRules.length === 0 && avoidRules.length === 0) {
    return;
  }

  const yesterday = new Date(baseDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);
  const finalizedThrough = readStorage<string | null>(
    DIET_APP_STORAGE_KEYS.ruleFinalizedThrough,
    null,
  );

  if (finalizedThrough && finalizedThrough >= yesterdayKey) {
    return;
  }

  const earliestRecentDate = new Date(yesterday);
  earliestRecentDate.setDate(earliestRecentDate.getDate() - 89);
  const earliestRecentDateKey = getLocalDateKey(earliestRecentDate);
  const firstUnfinalizedDateKey = finalizedThrough
    ? getNextDateKey(finalizedThrough)
    : yesterdayKey;
  const firstDateKey =
    firstUnfinalizedDateKey < earliestRecentDateKey
      ? earliestRecentDateKey
      : firstUnfinalizedDateKey;
  const datesToFinalize: string[] = [];
  let cursor = firstDateKey;

  while (cursor <= yesterdayKey) {
    datesToFinalize.push(cursor);
    cursor = getNextDateKey(cursor);
  }

  const history = loadRuleHistory();
  const historyByDate = new Map(history.map((entry) => [entry.date, entry]));

  datesToFinalize.forEach((date) => {
    const existing = historyByDate.get(date);

    historyByDate.set(date, {
      date,
      doRuleStatuses: Object.fromEntries(
        doRules.map((rule) => [
          rule.id,
          existing?.doRuleStatuses[rule.id] === "done" ? "done" : "failed",
        ]),
      ),
      avoidRuleStatuses: Object.fromEntries(
        avoidRules.map((rule) => [
          rule.id,
          existing?.avoidRuleStatuses[rule.id] === "done" ? "done" : "failed",
        ]),
      ),
    });
  });

  window.localStorage.setItem(
    DIET_APP_STORAGE_KEYS.ruleFinalizedThrough,
    yesterdayKey,
  );
  saveRuleHistory(
    [...historyByDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1)),
  );
}

export function cancelPendingDietAppSync() {
  if (syncTimer) {
    clearTimeout(syncTimer);
    syncTimer = null;
  }

  syncAbortController?.abort();
  syncAbortController = null;
}

export function isDietAppResetPending() {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem(DAILYOK_RESET_PENDING_KEY) === "1"
  );
}

export function markDietAppResetPending() {
  if (typeof window === "undefined") {
    return;
  }

  cancelPendingDietAppSync();
  window.localStorage.setItem(DAILYOK_RESET_PENDING_KEY, "1");
}

export function clearDietAppResetPending() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(DAILYOK_RESET_PENDING_KEY);
}

export function resetDietAppStorage(options?: { syncServer?: boolean }) {
  if (typeof window === "undefined") {
    return;
  }

  cancelPendingDietAppSync();

  Object.values(DIET_APP_STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });

  window.localStorage.removeItem("food-list");
  window.dispatchEvent(new CustomEvent(DAILYOK_LOCAL_EVENT));

  if (options?.syncServer !== false) {
    queueServerSync();
  }
}
