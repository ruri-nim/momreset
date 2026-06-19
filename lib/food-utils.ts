import type { FoodSearchItem, MealCategory, MealRecord } from "@/types/food";

export function createMealRecord(
  item: FoodSearchItem,
  portionMultiplier = 1,
  category: MealCategory = "점심",
  consumedGrams?: number,
): MealRecord {
  return {
    id: `${item.id}-${Date.now()}`,
    name: item.name,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    servingSize: item.servingSize,
    hydrationFriendly: item.hydrationFriendly,
    portionMultiplier,
    consumedGrams,
    category,
    source: "search",
    loggedAt: new Date().toISOString(),
  };
}

export function normalizeFoodNames(foods: string[]) {
  return foods
    .map((food) => food.trim())
    .filter(Boolean)
    .slice(0, 8);
}
