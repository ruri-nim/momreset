"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { DAILYOK_LOCAL_EVENT, DIET_APP_STORAGE_KEYS } from "@/lib/diet-app-storage";
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

        if (payload.hasServerData) {
          writeSnapshotToLocal(payload.snapshot);
          return;
        }

        if (hasLocalData(localSnapshot)) {
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
