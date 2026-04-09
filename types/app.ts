import type { MealRecord } from "@/types/food";

export type AppTab = "home" | "exercise" | "food" | "report" | "my";
export type AuthMode = "guest" | "google" | "kakao";
export type ExercisePlanStatus = "done" | "rest";
export type DeliveryType = "vaginal" | "c-section";
export type FeedingType = "breastfeeding" | "mixed" | "formula";
export type AppPhase = "recovery" | "reset";
export type OnboardingDeliveryType = "자연분만" | "제왕절개";
export type OnboardingGoalMode = "회복 우선" | "회복 + 체형 회복" | "감량까지 함께 관리";
export type SleepBucket = "4h 이하" | "4-6h" | "6-8h" | "8h+";
export type HydrationBucket = "3컵 이하" | "4-5컵" | "6-7컵" | "8컵+";
export type PainBucket = "0-3" | "4-6" | "7-10";
export type BleedingBucket = "없음" | "적음" | "보통" | "많음";
export type ExerciseBucket = "없음" | "10분" | "20분+" | "30분+";
export type NutritionBucket = "부족" | "보통" | "충분";
export type FeedingBucket = "모유" | "혼합" | "분유";
export type ScarDiscomfortBucket = "없음" | "약간" | "뚜렷함";
export type AbdominalPressureBucket = "없음" | "약간" | "뚜렷함";
export type PelvicFloorDiscomfortBucket = "없음" | "약간" | "뚜렷함";

export interface OnboardingData {
  hasCompletedOnboarding: boolean;
  birthDate: string;
  deliveryType: OnboardingDeliveryType;
  feedingType: "모유" | "혼합" | "분유";
  postpartumStartWeightKg: string;
  currentWeightKg: string;
  targetWeightKg: string;
  goalMode: OnboardingGoalMode;
}

export interface DailyCheckIn {
  dateKey: string;
  postpartumDay: number;
  sleepHours: number;
  sleepBucket?: SleepBucket;
  hydrationCups?: number;
  hydrationBucket?: HydrationBucket;
  hydrationLiters: number;
  painLevel: number;
  painBucket?: PainBucket;
  bleedingLevel: number;
  bleedingBucket?: BleedingBucket;
  exerciseMinutes: number;
  exerciseBucket?: ExerciseBucket;
  feedingType: FeedingType;
  feedingBucket?: FeedingBucket;
  selfReportedNutrition?: NutritionBucket;
  scarDiscomfortLevel?: number;
  scarDiscomfortBucket?: ScarDiscomfortBucket;
  abdominalPressureLevel?: number;
  abdominalPressureBucket?: AbdominalPressureBucket;
  pelvicFloorDiscomfortLevel?: number;
  pelvicFloorDiscomfortBucket?: PelvicFloorDiscomfortBucket;
  weightKg?: number;
}

export interface DailyWeightLog {
  dateKey: string;
  weightKg: number;
}

export interface AppUiState {
  lastDailyPopupDismissedDate?: string;
  authMode?: AuthMode;
  guestSessionId?: string;
  guestSessionStartedAt?: string;
  notificationsEnabled?: boolean;
  darkModeEnabled?: boolean;
  todayExercisePlanStatus?: ExercisePlanStatus;
}

export interface UserProfile {
  name: string;
  deliveryType: DeliveryType;
  birthDate?: string;
  postpartumDay: number;
  postpartumStartWeightKg?: number;
  currentWeightKg: number;
  targetWeightKg: number;
  feedingType: FeedingType;
  goalMode?: OnboardingGoalMode;
}

export interface ExerciseRecommendation {
  title: string;
  durationMinutes: number;
  intensityLabel: string;
  tip: string;
  stageLabel: string;
  focus: string;
  routine: string[];
  caution?: string;
  recoveryNote: string;
  exerciseReason: string;
  appropriateness: "low" | "appropriate" | "high";
}

export interface ReportSummary {
  label: string;
  value: string;
  tone: "rose" | "sage" | "neutral";
}

export interface NutritionResult {
  score: number;
  alerts: string[];
  calorieAdequacy: number;
  proteinAdequacy: number;
  hydrationMealRatio: number;
  completeness: number;
}

export interface AppState {
  profile: UserProfile;
  today: string;
  checkIns: DailyCheckIn[];
  weightLogs: DailyWeightLog[];
  meals: MealRecord[];
  ui: AppUiState;
}
