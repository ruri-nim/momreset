"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  DAILYOK_LOCAL_EVENT,
  DIET_APP_STORAGE_KEYS,
  finalizeUnrecordedRuleDays,
  isDietAppResetPending,
} from "@/lib/diet-app-storage";
import type { DietAppSnapshot } from "@/types/diet-app";

function readLocalSnapshot(): DietAppSnapshot {
  const read = <T,>(key: string, fallback: T) => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };

  return {
    foodList: read(DIET_APP_STORAGE_KEYS.foodList, []),
    doRules: read(DIET_APP_STORAGE_KEYS.doRules, []),
    avoidRules: read(DIET_APP_STORAGE_KEYS.avoidRules, []),
    exerciseLogs: read(DIET_APP_STORAGE_KEYS.exerciseLogs, []),
    bodyWeightKg: read(DIET_APP_STORAGE_KEYS.bodyWeightKg, 55),
    weightHistory: read(DIET_APP_STORAGE_KEYS.weightHistory, []),
    ruleHistory: read(DIET_APP_STORAGE_KEYS.ruleHistory, []),
    onboardingProfile: read(DIET_APP_STORAGE_KEYS.onboardingProfile, null),
  };
}

function hasLocalData(snapshot: DietAppSnapshot) {
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

function mergeById<T extends { id: string }>(localItems: T[], serverItems: T[]) {
  const itemsById = new Map<string, T>();

  serverItems.forEach((item) => {
    itemsById.set(item.id, item);
  });
  localItems.forEach((item) => {
    itemsById.set(item.id, item);
  });

  return [...itemsById.values()];
}

function mergeRuleHistory(
  localHistory: DietAppSnapshot["ruleHistory"],
  serverHistory: DietAppSnapshot["ruleHistory"],
) {
  const entriesByDate = new Map<string, DietAppSnapshot["ruleHistory"][number]>();

  serverHistory.forEach((entry) => {
    entriesByDate.set(entry.date, entry);
  });
  localHistory.forEach((entry) => {
    entriesByDate.set(entry.date, entry);
  });

  return [...entriesByDate.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function mergeSnapshots(localSnapshot: DietAppSnapshot, serverSnapshot: DietAppSnapshot) {
  return {
    foodList: mergeById(localSnapshot.foodList, serverSnapshot.foodList),
    doRules: mergeById(localSnapshot.doRules, serverSnapshot.doRules),
    avoidRules: mergeById(localSnapshot.avoidRules, serverSnapshot.avoidRules),
    exerciseLogs: mergeById(localSnapshot.exerciseLogs, serverSnapshot.exerciseLogs),
    bodyWeightKg:
      localSnapshot.bodyWeightKg !== 55 ? localSnapshot.bodyWeightKg : serverSnapshot.bodyWeightKg,
    weightHistory: mergeById(localSnapshot.weightHistory, serverSnapshot.weightHistory),
    ruleHistory: mergeRuleHistory(localSnapshot.ruleHistory, serverSnapshot.ruleHistory),
    onboardingProfile: localSnapshot.onboardingProfile ?? serverSnapshot.onboardingProfile,
  };
}

function writeSnapshotToLocal(snapshot: DietAppSnapshot) {
  window.localStorage.setItem(DIET_APP_STORAGE_KEYS.foodList, JSON.stringify(snapshot.foodList));
  window.localStorage.setItem(DIET_APP_STORAGE_KEYS.doRules, JSON.stringify(snapshot.doRules));
  window.localStorage.setItem(DIET_APP_STORAGE_KEYS.avoidRules, JSON.stringify(snapshot.avoidRules));
  window.localStorage.setItem(
    DIET_APP_STORAGE_KEYS.exerciseLogs,
    JSON.stringify(snapshot.exerciseLogs),
  );
  window.localStorage.setItem(
    DIET_APP_STORAGE_KEYS.bodyWeightKg,
    JSON.stringify(snapshot.bodyWeightKg),
  );
  window.localStorage.setItem(
    DIET_APP_STORAGE_KEYS.weightHistory,
    JSON.stringify(snapshot.weightHistory),
  );
  window.localStorage.setItem(
    DIET_APP_STORAGE_KEYS.ruleHistory,
    JSON.stringify(snapshot.ruleHistory),
  );
  window.localStorage.setItem(
    DIET_APP_STORAGE_KEYS.onboardingProfile,
    JSON.stringify(snapshot.onboardingProfile),
  );
  window.dispatchEvent(new CustomEvent(DAILYOK_LOCAL_EVENT));
}

export function SessionSync() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;

    if (isDietAppResetPending()) {
      fetch("/api/dailyok/snapshot", { method: "DELETE" }).catch(() => {
        // Keep the reset marker so deletion can be retried on the next authenticated load.
      });
      return;
    }

    fetch("/api/dailyok/snapshot")
      .then(async (response) => {
        const payload = (await response.json()) as {
          enabled?: boolean;
          hasServerData?: boolean;
          snapshot?: DietAppSnapshot;
        };

        if (cancelled || !payload.enabled || !payload.snapshot) {
          return;
        }

        const localSnapshot = readLocalSnapshot();
        const localHasData = hasLocalData(localSnapshot);

        if (payload.hasServerData) {
          const nextSnapshot = localHasData
            ? mergeSnapshots(localSnapshot, payload.snapshot)
            : payload.snapshot;

          writeSnapshotToLocal(nextSnapshot);
          finalizeUnrecordedRuleDays();

          if (localHasData) {
            await fetch("/api/dailyok/snapshot", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(nextSnapshot),
            });
          }
          return;
        }

        if (localHasData) {
          await fetch("/api/dailyok/snapshot", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(localSnapshot),
          });
        }
      })
      .catch(() => {
        // Keep local-only usage working even if remote sync fails.
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  return null;
}
