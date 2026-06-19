import type { OnboardingProfile } from "@/types/diet-app";

export const DEFAULT_DAILY_TARGET_CALORIES = 1700;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToNearestTen(value: number) {
  return Math.round(value / 10) * 10;
}

export function calculateDailyTargetCalories(
  currentWeightKg: number,
  profile: OnboardingProfile | null,
  baseDate = new Date(),
) {
  if (!profile || !currentWeightKg) {
    return DEFAULT_DAILY_TARGET_CALORIES;
  }

  if (profile.customDailyTargetCalories) {
    return roundToNearestTen(clamp(profile.customDailyTargetCalories, 1200, 2600));
  }

  const maintenanceCalories = currentWeightKg * 30;
  const targetDate = new Date(`${profile.targetDate}T00:00:00`);
  const today = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    0,
    0,
    0,
    0,
  );
  const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const safeDaysRemaining = Math.max(14, daysRemaining);
  const weightDeltaKg = currentWeightKg - profile.goalWeightKg;
  const calorieAdjustmentPerDay = clamp((weightDeltaKg * 7700) / safeDaysRemaining, -500, 700);
  const suggestedCalories = maintenanceCalories - calorieAdjustmentPerDay;

  return roundToNearestTen(clamp(suggestedCalories, 1200, 2600));
}
