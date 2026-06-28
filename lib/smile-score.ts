import type { SmileLevel } from "@/types/diet-app";

function getCalorieScore(netCalories: number, targetCalories: number) {
  if (targetCalories <= 0 || netCalories <= targetCalories) {
    return 1;
  }

  const targetRatio = netCalories / targetCalories;

  if (targetRatio <= 1.1) {
    return 0.7;
  }

  if (targetRatio <= 1.2) {
    return 0.4;
  }

  return 0;
}

export function getSmileLevelForDay(
  netCalories: number,
  hasFood: boolean,
  doneCount: number,
  failedCount: number,
  targetCalories: number,
): SmileLevel {
  const evaluatedRuleCount = doneCount + failedCount;

  if (!hasFood && evaluatedRuleCount === 0) {
    return "neutral";
  }

  const ruleScore = evaluatedRuleCount > 0 ? doneCount / evaluatedRuleCount : null;
  const calorieScore = hasFood ? getCalorieScore(netCalories, targetCalories) : null;
  const combinedScore =
    ruleScore !== null && calorieScore !== null
      ? ruleScore * 0.7 + calorieScore * 0.3
      : (ruleScore ?? calorieScore ?? 0.5);
  const hasEnoughForTopSmile =
    evaluatedRuleCount >= 2 || (hasFood && doneCount >= 1);

  if (combinedScore >= 0.9 && hasEnoughForTopSmile) {
    return "very_happy";
  }

  if (combinedScore >= 0.7) {
    return "happy";
  }

  if (combinedScore >= 0.45) {
    return "neutral";
  }

  if (combinedScore >= 0.2) {
    return "sad";
  }

  return "very_sad";
}
