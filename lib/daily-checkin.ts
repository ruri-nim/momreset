import { getAppPhase } from "@/lib/phase";
import { formatDateKey } from "@/lib/utils";
import type {
  AbdominalPressureBucket,
  AppPhase,
  AppState,
  BleedingBucket,
  DailyCheckIn,
  DailyWeightLog,
  ExerciseBucket,
  FeedingBucket,
  FeedingType,
  HydrationBucket,
  NutritionBucket,
  PainBucket,
  PelvicFloorDiscomfortBucket,
  ScarDiscomfortBucket,
  SleepBucket,
} from "@/types/app";

export interface RecoveryCheckinFormValue {
  sleep: SleepBucket;
  hydration: HydrationBucket;
  pain: PainBucket;
  bleeding: BleedingBucket;
  exercise: ExerciseBucket;
  nutrition: NutritionBucket;
  feeding: FeedingBucket;
  scarDiscomfort: ScarDiscomfortBucket;
  abdominalPressure: AbdominalPressureBucket;
  pelvicFloorDiscomfort: PelvicFloorDiscomfortBucket;
  weightKg: string;
}

function mapFeedingType(feeding: FeedingBucket): FeedingType {
  switch (feeding) {
    case "모유":
      return "breastfeeding";
    case "혼합":
      return "mixed";
    default:
      return "formula";
  }
}

export function getTodayDateKey() {
  return formatDateKey(new Date());
}

export function getYesterdayDateKey() {
  return formatDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
}

export function mapSleepBucketToHours(bucket: SleepBucket) {
  switch (bucket) {
    case "4h 이하":
      return 3.5;
    case "4-6h":
      return 5;
    case "6-8h":
      return 7;
    default:
      return 8.5;
  }
}

export function mapHydrationBucketToCups(bucket: HydrationBucket) {
  switch (bucket) {
    case "3컵 이하":
      return 3;
    case "4-5컵":
      return 4.5;
    case "6-7컵":
      return 6.5;
    default:
      return 8;
  }
}

export function mapHydrationCupsToLiters(cups: number) {
  return Number((cups * 0.24).toFixed(1));
}

export function mapPainBucketToLevel(bucket: PainBucket) {
  switch (bucket) {
    case "0-3":
      return 2;
    case "4-6":
      return 5;
    default:
      return 8;
  }
}

export function mapBleedingBucketToLevel(bucket: BleedingBucket) {
  switch (bucket) {
    case "없음":
      return 0;
    case "적음":
      return 2;
    case "보통":
      return 5;
    default:
      return 8;
  }
}

export function mapExerciseBucketToMinutes(bucket: ExerciseBucket) {
  switch (bucket) {
    case "없음":
      return 0;
    case "10분":
      return 10;
    case "20분+":
      return 20;
    default:
      return 30;
  }
}

function mapRecoveryDiscomfortBucketToLevel(
  bucket: ScarDiscomfortBucket | AbdominalPressureBucket | PelvicFloorDiscomfortBucket,
) {
  switch (bucket) {
    case "없음":
      return 0;
    case "약간":
      return 3;
    default:
      return 7;
  }
}

export function getPhaseForDailyCheckin(postpartumDay: number): AppPhase {
  return getAppPhase(postpartumDay);
}

export function hasYesterdayRecoveryLog(state: AppState) {
  const yesterday = getYesterdayDateKey();
  return state.checkIns.some((checkIn) => checkIn.dateKey === yesterday);
}

export function hasYesterdayWeightLog(state: AppState) {
  const yesterday = getYesterdayDateKey();
  return state.weightLogs.some((weightLog) => weightLog.dateKey === yesterday);
}

export function shouldShowDailyPopup(state: AppState) {
  const today = getTodayDateKey();
  if (state.ui.lastDailyPopupDismissedDate === today) {
    return false;
  }

  const phase = getPhaseForDailyCheckin(state.profile.postpartumDay);
  if (phase === "recovery") {
    return !hasYesterdayRecoveryLog(state);
  }

  return !hasYesterdayWeightLog(state);
}

export function createRecoveryLogFromForm(
  value: RecoveryCheckinFormValue,
  postpartumDay: number,
): DailyCheckIn {
  const hydrationCups = mapHydrationBucketToCups(value.hydration);

  return {
    dateKey: getYesterdayDateKey(),
    postpartumDay: Math.max(postpartumDay - 1, 0),
    sleepHours: mapSleepBucketToHours(value.sleep),
    sleepBucket: value.sleep,
    hydrationCups,
    hydrationBucket: value.hydration,
    hydrationLiters: mapHydrationCupsToLiters(hydrationCups),
    painLevel: mapPainBucketToLevel(value.pain),
    painBucket: value.pain,
    bleedingLevel: mapBleedingBucketToLevel(value.bleeding),
    bleedingBucket: value.bleeding,
    exerciseMinutes: mapExerciseBucketToMinutes(value.exercise),
    exerciseBucket: value.exercise,
    feedingType: mapFeedingType(value.feeding),
    feedingBucket: value.feeding,
    selfReportedNutrition: value.nutrition,
    scarDiscomfortLevel: mapRecoveryDiscomfortBucketToLevel(value.scarDiscomfort),
    scarDiscomfortBucket: value.scarDiscomfort,
    abdominalPressureLevel: mapRecoveryDiscomfortBucketToLevel(value.abdominalPressure),
    abdominalPressureBucket: value.abdominalPressure,
    pelvicFloorDiscomfortLevel: mapRecoveryDiscomfortBucketToLevel(value.pelvicFloorDiscomfort),
    pelvicFloorDiscomfortBucket: value.pelvicFloorDiscomfort,
    weightKg: (() => {
      const parsed = Number(value.weightKg);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
    })(),
  };
}

export function createWeightLog(weightKg: number): DailyWeightLog {
  return {
    dateKey: getYesterdayDateKey(),
    weightKg,
  };
}

export function markDailyPopupDismissed(state: AppState): AppState {
  return {
    ...state,
    ui: {
      ...state.ui,
      lastDailyPopupDismissedDate: getTodayDateKey(),
    },
  };
}
