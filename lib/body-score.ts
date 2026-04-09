import { scoreExerciseMinutes } from "@/lib/exercise";
import type { DailyCheckIn, NutritionResult } from "@/types/app";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function scoreSleep(hours: number) {
  if (hours <= 2) return 25;
  if (hours >= 7) return 100;
  return clamp(Math.round(30 + ((hours - 2) / 5) * 70));
}

function scoreHydration(cups: number) {
  if (cups >= 8) return 100;
  if (cups >= 6) return 80;
  if (cups >= 4) return 60;
  return 40;
}

function scorePain(level: number) {
  if (level <= 2) return 100;
  if (level <= 4) return 75;
  if (level <= 6) return 55;
  return 35;
}

function bleedingPenalty(level: number) {
  if (level <= 0) return 4;
  if (level <= 2) return 0;
  if (level <= 6) return -8;
  return -18;
}

export function getFeedingMultiplier(feedingType: DailyCheckIn["feedingType"]) {
  switch (feedingType) {
    case "breastfeeding":
      return 0.9;
    case "mixed":
      return 0.95;
    default:
      return 1;
  }
}

export function calculateBodyScore(checkIn: DailyCheckIn, nutrition: NutritionResult) {
  const breakdown = getBodyScoreBreakdown(checkIn, nutrition);

  const raw =
    breakdown.sleep * 0.25 +
    breakdown.exercise * 0.2 +
    breakdown.nutrition * 0.2 +
    breakdown.hydration * 0.1 +
    breakdown.pain * 0.15 +
    10 +
    breakdown.bleedingPenalty;

  return clamp(Math.round(raw * breakdown.feedingMultiplier));
}

export function getBodyScoreBreakdown(checkIn: DailyCheckIn, nutrition: NutritionResult) {
  const sleep = scoreSleep(checkIn.sleepHours);
  const hydrationCups =
    checkIn.hydrationCups ??
    Math.max(0, Math.round((checkIn.hydrationLiters / 0.24) * 10) / 10);
  const hydration = scoreHydration(hydrationCups);
  const pain = scorePain(checkIn.painLevel);
  const exercise = scoreExerciseMinutes(checkIn.postpartumDay, checkIn.exerciseMinutes);
  const feedingMultiplier = getFeedingMultiplier(checkIn.feedingType);
  return {
    sleep,
    hydration,
    pain,
    exercise,
    nutrition: nutrition.score,
    bleedingPenalty: bleedingPenalty(checkIn.bleedingLevel),
    feedingMultiplier,
  };
}

export function getBodyScoreInsight(checkIn: DailyCheckIn, nutrition: NutritionResult) {
  const breakdown = getBodyScoreBreakdown(checkIn, nutrition);

  const drivers = [
    {
      label:
        breakdown.sleep < 70 ? "수면이 조금 부족해요." : "수면",
      severity: breakdown.sleep < 70 ? 3 : breakdown.sleep < 85 ? 1 : 0,
    },
    {
      label:
        breakdown.exercise < 75 ? "운동 강도가 지금 단계와 조금 안 맞아요." : "운동",
      severity: breakdown.exercise < 75 ? 3 : breakdown.exercise < 90 ? 1 : 0,
    },
    {
      label:
        breakdown.nutrition < 70 ? "영양이 아직 충분히 채워지지 않았어요." : "영양",
      severity: breakdown.nutrition < 70 ? 3 : breakdown.nutrition < 85 ? 1 : 0,
    },
    {
      label:
        breakdown.hydration < 80 ? "수분이 조금 부족한 편이에요." : "수분",
      severity: breakdown.hydration < 80 ? 2 : 0,
    },
    {
      label:
        breakdown.pain < 75 ? "통증 영향이 조금 있어요." : "통증",
      severity: breakdown.pain < 75 ? 3 : 0,
    },
    {
      label:
        breakdown.bleedingPenalty < 0 ? "출혈 신호가 점수에 반영됐어요." : "출혈",
      severity: breakdown.bleedingPenalty < 0 ? 3 : 0,
    },
    {
      label:
        breakdown.feedingMultiplier < 1 ? "수유 부담을 함께 고려했어요." : "수유",
      severity: breakdown.feedingMultiplier < 1 ? 1 : 0,
    },
  ]
    .filter((item) => item.severity > 0)
    .sort((left, right) => right.severity - left.severity);

  if (!drivers.length) {
    return "전반적으로 안정적인 흐름이라 100점에 가깝게 나왔어요.";
  }

  if (drivers.length === 1) {
    return drivers[0].label;
  }

  return `${drivers[0].label.replace(/\.$/, "")} ${drivers[1].label}`;
}
