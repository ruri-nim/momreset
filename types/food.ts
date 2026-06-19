export type MealSource = "photo" | "search";
export type MealCategory = "아침" | "점심" | "저녁" | "간식";

export interface FoodSearchItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
  hydrationFriendly: boolean;
}

export interface MealRecord {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  servingSize?: string;
  hydrationFriendly: boolean;
  portionMultiplier: number;
  consumedGrams?: number;
  category: MealCategory;
  source: MealSource;
  loggedAt: string;
}
