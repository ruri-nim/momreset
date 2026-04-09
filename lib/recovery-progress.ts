import { calculateNutrition } from "@/lib/nutrition";
import type {
  AppState,
  BleedingBucket,
  DailyCheckIn,
  FeedingType,
} from "@/types/app";

export type RecoveryStage =
  | "회복 초기"
  | "회복 적응기"
  | "회복 안정기"
  | "리셋/감량 단계";

export type ExerciseAppropriateness = "appropriate" | "under" | "over";

export interface RecoveryAdjustmentParams {
  rollingSleepHours: number;
  rollingPainLevel: number;
  bleedingLevel: BleedingBucket | number;
  exerciseAppropriateness: ExerciseAppropriateness;
  nutritionAdequacy: number;
  loggingCompleteness: number;
}

export interface RecoveryProgressParams extends RecoveryAdjustmentParams {
  postpartumDays: number;
}

export interface RecoverySignalSnapshot extends RecoveryProgressParams {
  adjustment: number;
  baseline: number;
  recoveryProgress: number;
}

interface RecoveryAdjustmentBreakdown {
  sleep: number;
  pain: number;
  bleeding: number;
  exercise: number;
  nutrition: number;
  logging: number;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toDateKeyDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

function getRollingCheckIns(checkIns: DailyCheckIn[], postpartumDays: number, days = 7) {
  return checkIns
    .filter(
      (checkIn) =>
        checkIn.postpartumDay <= postpartumDays &&
        checkIn.postpartumDay >= Math.max(0, postpartumDays - (days - 1)),
    )
    .sort((left, right) => left.postpartumDay - right.postpartumDay);
}

function getBleedingBucket(level: BleedingBucket | number): BleedingBucket {
  if (typeof level === "string") {
    return level;
  }

  if (level <= 0) {
    return "없음";
  }
  if (level <= 2) {
    return "적음";
  }
  if (level <= 6) {
    return "보통";
  }
  return "많음";
}

function getLoggingCompleteness(checkIns: DailyCheckIn[], postpartumDays: number, days = 7) {
  const expectedDays = Math.max(1, Math.min(days, postpartumDays + 1));
  const recentLogs = getRollingCheckIns(checkIns, postpartumDays, days);
  const uniqueDateKeys = new Set(recentLogs.map((checkIn) => checkIn.dateKey));
  return clamp(Math.round((uniqueDateKeys.size / expectedDays) * 100));
}

export function getPostpartumDays(birthDate: string, now = new Date()) {
  if (!birthDate) {
    return 0;
  }

  const birth = new Date(birthDate);
  birth.setHours(0, 0, 0, 0);

  const current = new Date(now);
  current.setHours(0, 0, 0, 0);

  return Math.max(
    0,
    Math.floor((current.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

export function getRecoveryWeek(postpartumDays: number) {
  return clamp(Math.ceil(Math.max(1, postpartumDays) / 7), 1, 6);
}

export function getRecoveryStage(postpartumDays: number): RecoveryStage {
  if (postpartumDays <= 7) {
    return "회복 초기";
  }
  if (postpartumDays <= 21) {
    return "회복 적응기";
  }
  if (postpartumDays <= 42) {
    return "회복 안정기";
  }
  return "리셋/감량 단계";
}

export function calculateRecoveryBaseline(postpartumDays: number) {
  return clamp(Math.round((postpartumDays / 42) * 100));
}

export function getWeeklyRecoveryTarget(postpartumDays: number) {
  const week = getRecoveryWeek(postpartumDays);
  const weeklyTargets = [25, 40, 55, 70, 85, 100];
  return weeklyTargets[week - 1] ?? 100;
}

export function getRecoveryDistance(progress: number, postpartumDays: number) {
  return Math.max(0, getWeeklyRecoveryTarget(postpartumDays) - progress);
}

export function getExerciseAppropriateness(
  postpartumDays: number,
  exerciseMinutes: number,
): ExerciseAppropriateness {
  if (postpartumDays <= 14) {
    if (exerciseMinutes <= 5) {
      return "appropriate";
    }
    if (exerciseMinutes <= 10) {
      return "under";
    }
    return "over";
  }

  if (postpartumDays <= 42) {
    if (exerciseMinutes >= 10 && exerciseMinutes <= 20) {
      return "appropriate";
    }
    if (exerciseMinutes < 10) {
      return "under";
    }
    return "over";
  }

  if (exerciseMinutes >= 20 && exerciseMinutes <= 40) {
    return "appropriate";
  }
  if (exerciseMinutes < 20) {
    return "under";
  }
  return "over";
}

export function calculateRecoveryAdjustmentBreakdown(
  params: RecoveryAdjustmentParams,
): RecoveryAdjustmentBreakdown {
  const bleedingBucket = getBleedingBucket(params.bleedingLevel);

  const sleep =
    params.rollingSleepHours >= 7 ? 3 : params.rollingSleepHours >= 5 ? 1 : -2;

  const pain =
    params.rollingPainLevel <= 2 ? 3 : params.rollingPainLevel <= 5 ? 0 : -4;

  const bleeding =
    bleedingBucket === "없음" || bleedingBucket === "적음"
      ? 2
      : bleedingBucket === "보통"
        ? -1
        : -5;

  const exercise =
    params.exerciseAppropriateness === "appropriate"
      ? 2
      : params.exerciseAppropriateness === "under"
        ? -1
        : -3;

  const nutrition =
    params.nutritionAdequacy >= 75 ? 3 : params.nutritionAdequacy >= 55 ? 0 : -3;

  const logging =
    params.loggingCompleteness >= 70 ? 1 : params.loggingCompleteness >= 40 ? 0 : -2;

  return {
    sleep,
    pain,
    bleeding,
    exercise,
    nutrition,
    logging,
  };
}

export function calculateRecoveryAdjustment(params: RecoveryAdjustmentParams) {
  const breakdown = calculateRecoveryAdjustmentBreakdown(params);
  const total =
    breakdown.sleep +
    breakdown.pain +
    breakdown.bleeding +
    breakdown.exercise +
    breakdown.nutrition +
    breakdown.logging;

  return clamp(total, -15, 10);
}

export function calculateRecoveryProgress(params: RecoveryProgressParams) {
  const baseline = calculateRecoveryBaseline(params.postpartumDays);
  const adjustment = calculateRecoveryAdjustment(params);

  return clamp(baseline + adjustment);
}

function getRecoveryNutritionAdequacy(meals: AppState["meals"], feedingType: FeedingType) {
  const nutrition = calculateNutrition(meals, feedingType);

  return Math.round(
    nutrition.calorieAdequacy * 0.4 +
      nutrition.proteinAdequacy * 0.35 +
      nutrition.hydrationMealRatio * 0.15 +
      nutrition.completeness * 0.1,
  );
}

export function getRecoverySignalSnapshot(
  state: AppState,
  postpartumDays = state.profile.postpartumDay,
): RecoverySignalSnapshot {
  const recentCheckIns = getRollingCheckIns(state.checkIns, postpartumDays, 7);
  const latestCheckIn = recentCheckIns[recentCheckIns.length - 1];
  const rollingSleepHours = recentCheckIns.length
    ? Number(average(recentCheckIns.map((checkIn) => checkIn.sleepHours)).toFixed(1))
    : 5.5;
  const rollingPainLevel = recentCheckIns.length
    ? Number(average(recentCheckIns.map((checkIn) => checkIn.painLevel)).toFixed(1))
    : 4;
  const averageExerciseMinutes = recentCheckIns.length
    ? Number(average(recentCheckIns.map((checkIn) => checkIn.exerciseMinutes)).toFixed(1))
    : postpartumDays <= 42
      ? 10
      : 20;
  const exerciseAppropriateness = getExerciseAppropriateness(
    postpartumDays,
    averageExerciseMinutes,
  );
  const bleedingLevel = latestCheckIn?.bleedingBucket ?? latestCheckIn?.bleedingLevel ?? "적음";
  const nutritionAdequacy = state.meals.length
    ? getRecoveryNutritionAdequacy(state.meals, state.profile.feedingType)
    : 60;
  const loggingCompleteness = getLoggingCompleteness(state.checkIns, postpartumDays);

  const baseline = calculateRecoveryBaseline(postpartumDays);
  const adjustment = calculateRecoveryAdjustment({
    rollingSleepHours,
    rollingPainLevel,
    bleedingLevel,
    exerciseAppropriateness,
    nutritionAdequacy,
    loggingCompleteness,
  });
  const recoveryProgress = clamp(baseline + adjustment);

  return {
    postpartumDays,
    rollingSleepHours,
    rollingPainLevel,
    bleedingLevel,
    exerciseAppropriateness,
    nutritionAdequacy,
    loggingCompleteness,
    baseline,
    adjustment,
    recoveryProgress,
  };
}

export function buildRecoveryProgressChartData(state: AppState) {
  const snapshot = getRecoverySignalSnapshot(state);
  const currentWeek = getRecoveryWeek(state.profile.postpartumDay);

  return Array.from({ length: 6 }, (_, index) => {
    const week = index + 1;
    const day = week * 7;
    const cappedDay = Math.min(day, state.profile.postpartumDay);
    const baseline = calculateRecoveryBaseline(cappedDay);
    const value = week <= currentWeek ? clamp(baseline + snapshot.adjustment) : null;

    return {
      label:
        week === currentWeek
          ? `${week}주 · 산후 ${state.profile.postpartumDay}일`
          : `${week}주`,
      value,
      target: getWeeklyRecoveryTarget(day),
    };
  });
}

export function buildRecoveryProgressHistory(state: AppState, period: number) {
  const points = Math.min(period, Math.max(1, state.profile.postpartumDay + 1));
  const recentNutritionAdequacy = state.meals.length
    ? getRecoveryNutritionAdequacy(state.meals, state.profile.feedingType)
    : 60;

  return Array.from({ length: points }, (_, index) => {
    const postpartumDays = Math.max(0, state.profile.postpartumDay - (points - 1 - index));
    const recentCheckIns = getRollingCheckIns(state.checkIns, postpartumDays, 7);
    const latestCheckIn = recentCheckIns[recentCheckIns.length - 1];
    const rollingSleepHours = recentCheckIns.length
      ? Number(average(recentCheckIns.map((checkIn) => checkIn.sleepHours)).toFixed(1))
      : 5.5;
    const rollingPainLevel = recentCheckIns.length
      ? Number(average(recentCheckIns.map((checkIn) => checkIn.painLevel)).toFixed(1))
      : 4;
    const averageExerciseMinutes = recentCheckIns.length
      ? Number(average(recentCheckIns.map((checkIn) => checkIn.exerciseMinutes)).toFixed(1))
      : postpartumDays <= 42
        ? 10
        : 20;

    return {
      label: `${index + 1}일`,
      value: calculateRecoveryProgress({
        postpartumDays,
        rollingSleepHours,
        rollingPainLevel,
        bleedingLevel: latestCheckIn?.bleedingBucket ?? latestCheckIn?.bleedingLevel ?? "적음",
        exerciseAppropriateness: getExerciseAppropriateness(
          postpartumDays,
          averageExerciseMinutes,
        ),
        nutritionAdequacy: recentNutritionAdequacy,
        loggingCompleteness: getLoggingCompleteness(state.checkIns, postpartumDays),
      }),
    };
  });
}

export function getLatestRecoveryLogDate(state: AppState) {
  const latestCheckIn = [...state.checkIns].sort((left, right) =>
    toDateKeyDate(left.dateKey).getTime() - toDateKeyDate(right.dateKey).getTime(),
  )[state.checkIns.length - 1];

  return latestCheckIn?.dateKey;
}
