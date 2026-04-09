import type { FeedingType, NutritionResult } from "@/types/app";
import type { MealRecord } from "@/types/food";

function getNutritionTargets(feedingType: FeedingType) {
  switch (feedingType) {
    case "breastfeeding":
      return { calories: 2100, protein: 75 };
    case "mixed":
      return { calories: 1900, protein: 70 };
    default:
      return { calories: 1700, protein: 60 };
  }
}

export function calculateNutrition(meals: MealRecord[], feedingType: FeedingType): NutritionResult {
  if (!meals.length) {
    return {
      score: 45,
      alerts: ["오늘 식사 기록이 부족해요"],
      calorieAdequacy: 0,
      proteinAdequacy: 0,
      hydrationMealRatio: 0,
      completeness: 0,
    };
  }

  const targets = getNutritionTargets(feedingType);
  const calories = meals.reduce(
    (sum, meal) => sum + meal.calories * meal.portionMultiplier,
    0,
  );
  const protein = meals.reduce(
    (sum, meal) => sum + meal.protein * meal.portionMultiplier,
    0,
  );
  const hydrationFriendlyMeals = meals.filter((meal) => meal.hydrationFriendly).length;

  const calorieAdequacy = Math.min(1, calories / targets.calories);
  const proteinAdequacy = Math.min(1, protein / targets.protein);
  const hydrationMealRatio = hydrationFriendlyMeals / meals.length;
  const completeness = Math.min(1, meals.length / 3);

  const mealQualityAverage =
    meals.reduce((sum, meal) => {
      const proteinDensity = Math.min(1, (meal.protein * meal.portionMultiplier) / 25);
      const hydrationSupport = meal.hydrationFriendly ? 1 : 0.6;
      return sum + (proteinDensity * 0.7 + hydrationSupport * 0.3);
    }, 0) / meals.length;

  const hydrationMealScore = hydrationMealRatio;

  const weightedScore =
    mealQualityAverage * 45 +
    calorieAdequacy * 25 +
    proteinAdequacy * 20 +
    hydrationMealScore * 10 +
    completeness * 5;

  const alerts: string[] = [];

  if (meals.length < 2) {
    alerts.push("오늘 식사 기록이 부족해요");
  }
  if (proteinAdequacy < 0.75) {
    alerts.push("단백질이 부족해요");
  }
  if (calorieAdequacy < 0.75) {
    alerts.push("총 섭취량이 회복 대비 부족해요");
  }
  if (hydrationMealRatio < 0.34) {
    alerts.push("수분감 있는 식사가 부족해요");
  }
  if (feedingType !== "formula" && calorieAdequacy < 0.9) {
    alerts.push("수유 중인데 섭취량이 조금 더 필요해요");
  }

  return {
    score: Math.min(100, Math.round(weightedScore)),
    alerts,
    calorieAdequacy: Math.round(calorieAdequacy * 100),
    proteinAdequacy: Math.round(proteinAdequacy * 100),
    hydrationMealRatio: Math.round(hydrationMealRatio * 100),
    completeness: Math.round(completeness * 100),
  };
}
