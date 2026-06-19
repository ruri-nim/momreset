export type SmileLevel =
  | "very_happy"
  | "happy"
  | "neutral"
  | "sad"
  | "very_sad";

export interface SmileDay {
  day: number;
  level: SmileLevel;
}

export interface RuleItem {
  id: string;
  title: string;
  status: "done" | "pending" | "failed";
}

export interface RuleHistoryEntry {
  date: string;
  doRuleStatuses: Record<string, RuleItem["status"]>;
  avoidRuleStatuses: Record<string, RuleItem["status"]>;
}

export interface FoodLogItem {
  id: string;
  name: string;
  calories: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  loggedAt?: string;
}

export interface ExerciseLogItem {
  id: string;
  name: string;
  minutes: number;
  burnedCalories: number;
  loggedAt?: string;
}

export interface WeightLogItem {
  id: string;
  date: string;
  weightKg: number;
}

export interface OnboardingProfile {
  completedAt: string;
  challenge: "야식" | "단음식" | "배달음식" | "불규칙한 식사";
  pace: "가볍게" | "꾸준하게" | "집중해서";
  coachTone: "다정하게" | "솔직하게" | "발랄하게";
  currentWeightKg: number;
  goalWeightKg: number;
  targetDate: string;
  customDailyTargetCalories?: number;
}
