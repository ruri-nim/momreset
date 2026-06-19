import type {
  ExerciseLogItem,
  FoodLogItem,
  RuleItem,
  SmileDay,
} from "@/types/diet-app";

export const smileCalendar: SmileDay[] = [
  { day: 1, level: "happy" },
  { day: 2, level: "neutral" },
  { day: 3, level: "very_happy" },
  { day: 4, level: "sad" },
  { day: 5, level: "happy" },
  { day: 6, level: "neutral" },
  { day: 7, level: "very_sad" },
  { day: 8, level: "happy" },
  { day: 9, level: "very_happy" },
  { day: 10, level: "happy" },
  { day: 11, level: "neutral" },
  { day: 12, level: "happy" },
  { day: 13, level: "sad" },
  { day: 14, level: "happy" },
];

export const todayDoRules: RuleItem[] = [
  { id: "do-1", title: "점심 후 15분 걷기", status: "done" },
  { id: "do-2", title: "물 2L 마시기", status: "pending" },
  { id: "do-3", title: "저녁 단백질 챙기기", status: "done" },
];

export const todayAvoidRules: RuleItem[] = [
  { id: "avoid-1", title: "야식 먹지 않기", status: "done" },
  { id: "avoid-2", title: "케이크 먹지 않기", status: "failed" },
];

export const todayFoodLogs: FoodLogItem[] = [
  { id: "food-1", name: "그릭요거트", calories: 180, mealType: "breakfast" },
  { id: "food-2", name: "닭가슴살 샐러드", calories: 420, mealType: "lunch" },
  { id: "food-3", name: "카페라떼", calories: 160, mealType: "snack" },
];

export const todayExerciseLogs: ExerciseLogItem[] = [
  { id: "exercise-1", name: "빠른 걷기", minutes: 28, burnedCalories: 170 },
  { id: "exercise-2", name: "가벼운 스트레칭", minutes: 12, burnedCalories: 40 },
];

export const calorieTrend = [
  { label: "월", consumed: 1620, target: 1700 },
  { label: "화", consumed: 1540, target: 1700 },
  { label: "수", consumed: 1780, target: 1700 },
  { label: "목", consumed: 1650, target: 1700 },
  { label: "금", consumed: 1490, target: 1700 },
  { label: "토", consumed: 1910, target: 1700 },
  { label: "일", consumed: 1680, target: 1700 },
];
