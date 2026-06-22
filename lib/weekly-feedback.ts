import { formatDateLabel, getDateKeyDaysAgo, getLocalDateKey } from "@/lib/diet-app-date";
import type {
  ExerciseLogItem,
  OnboardingProfile,
  RuleHistoryEntry,
  RuleItem,
  WeightLogItem,
} from "@/types/diet-app";

export interface WeeklyFoodLogItem {
  id: string;
  name: string;
  calories: number;
  mealSection?: "아침" | "점심" | "저녁" | "간식";
  loggedAt: string;
}

export interface WeeklyInsightSummary {
  periodLabel: string;
  startDate: string;
  endDate: string;
  goalCalories: number;
  daysLoggedFood: number;
  averageCalories: number;
  highCalorieDays: number;
  snackDays: number;
  dessertCount: number;
  sweetDrinkCount: number;
  alcoholCount: number;
  deliveryFoodCount: number;
  exerciseDays: number;
  exerciseMinutes: number;
  exerciseCalories: number;
  doRuleSuccessRate: number;
  avoidRuleFailCount: number;
  weightStart: number | null;
  weightEnd: number | null;
  weightChange: number | null;
  topFoods: string[];
  dominantMealSection: string | null;
  challenge: OnboardingProfile["challenge"] | null;
  coachTone: OnboardingProfile["coachTone"] | null;
}

export interface WeeklyAiFeedback {
  summary: string;
  goodJob: string[];
  watchOut: string[];
  nextAction: string[];
}

const dessertKeywords = [
  "케이크",
  "쿠키",
  "아이스크림",
  "마카롱",
  "초콜릿",
  "도넛",
  "디저트",
  "타르트",
  "빙수",
  "와플",
  "푸딩",
];
const sweetDrinkKeywords = [
  "라떼",
  "버블티",
  "밀크티",
  "주스",
  "스무디",
  "에이드",
  "콜라",
  "사이다",
  "음료",
  "프라푸치노",
];
const alcoholKeywords = ["술", "맥주", "소주", "와인", "칵테일", "하이볼"];
const deliveryKeywords = ["배달", "치킨", "피자", "떡볶이", "햄버거", "족발", "보쌈"];

function includesKeyword(name: string, keywords: string[]) {
  return keywords.some((keyword) => name.includes(keyword));
}

function getDominantMealSection(foods: WeeklyFoodLogItem[]) {
  const sectionTotals = ["아침", "점심", "저녁", "간식"].map((section) => ({
    section,
    calories: foods
      .filter((item) => item.mealSection === section)
      .reduce((sum, item) => sum + item.calories, 0),
  }));
  const topSection = sectionTotals.sort((a, b) => b.calories - a.calories)[0];

  return topSection?.calories ? topSection.section : null;
}

function getTopFoods(foods: WeeklyFoodLogItem[]) {
  const counts = new Map<string, number>();

  foods.forEach((item) => {
    counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
}

export function buildWeeklyInsightSummary(params: {
  foods: WeeklyFoodLogItem[];
  exerciseLogs: ExerciseLogItem[];
  ruleHistory: RuleHistoryEntry[];
  doRules: RuleItem[];
  avoidRules: RuleItem[];
  weightHistory: WeightLogItem[];
  profile: OnboardingProfile | null;
  goalCalories: number;
  baseDate?: Date;
}) : WeeklyInsightSummary {
  const baseDate = params.baseDate ?? new Date();
  const dateKeys = Array.from({ length: 7 }, (_, index) => getDateKeyDaysAgo(6 - index, baseDate));
  const startDate = dateKeys[0];
  const endDate = dateKeys[dateKeys.length - 1] ?? getLocalDateKey(baseDate);
  const weeklyFoods = params.foods.filter((item) => dateKeys.includes(item.loggedAt));
  const weeklyExercises = params.exerciseLogs.filter((item) =>
    dateKeys.includes(item.loggedAt ?? ""),
  );
  const weeklyRuleHistory = params.ruleHistory.filter((item) => dateKeys.includes(item.date));

  const dailyCalories = dateKeys.map((dateKey) =>
    weeklyFoods
      .filter((item) => item.loggedAt === dateKey)
      .reduce((sum, item) => sum + item.calories, 0),
  );
  const loggedDays = dailyCalories.filter((value) => value > 0);
  const averageCalories = loggedDays.length
    ? Math.round(loggedDays.reduce((sum, value) => sum + value, 0) / loggedDays.length)
    : 0;

  const doStatuses = weeklyRuleHistory.flatMap((item) => Object.values(item.doRuleStatuses));
  const avoidStatuses = weeklyRuleHistory.flatMap((item) => Object.values(item.avoidRuleStatuses));
  const doDoneCount = doStatuses.filter((status) => status === "done").length;
  const doRuleSuccessRate = doStatuses.length ? Math.round((doDoneCount / doStatuses.length) * 100) : 0;
  const avoidRuleFailCount = avoidStatuses.filter((status) => status === "failed").length;

  const latestWeight = params.weightHistory[0]?.weightKg ?? params.profile?.currentWeightKg ?? null;
  const oldestWeightEntry = [...params.weightHistory]
    .reverse()
    .find((item) => dateKeys.includes(item.date));
  const newestWeightEntry = params.weightHistory.find((item) => dateKeys.includes(item.date));
  const weightStart = oldestWeightEntry?.weightKg ?? latestWeight;
  const weightEnd = newestWeightEntry?.weightKg ?? latestWeight;
  const weightChange =
    weightStart !== null && weightEnd !== null ? Number((weightEnd - weightStart).toFixed(1)) : null;

  return {
    periodLabel: `${formatDateLabel(startDate)} - ${formatDateLabel(endDate)}`,
    startDate,
    endDate,
    goalCalories: params.goalCalories,
    daysLoggedFood: loggedDays.length,
    averageCalories,
    highCalorieDays: dailyCalories.filter((value) => value > params.goalCalories).length,
    snackDays: dateKeys.filter((dateKey) =>
      weeklyFoods.some((item) => item.loggedAt === dateKey && item.mealSection === "간식"),
    ).length,
    dessertCount: weeklyFoods.filter((item) => includesKeyword(item.name, dessertKeywords)).length,
    sweetDrinkCount: weeklyFoods.filter((item) => includesKeyword(item.name, sweetDrinkKeywords)).length,
    alcoholCount: weeklyFoods.filter((item) => includesKeyword(item.name, alcoholKeywords)).length,
    deliveryFoodCount: weeklyFoods.filter((item) => includesKeyword(item.name, deliveryKeywords)).length,
    exerciseDays: new Set(weeklyExercises.map((item) => item.loggedAt)).size,
    exerciseMinutes: weeklyExercises.reduce((sum, item) => sum + item.minutes, 0),
    exerciseCalories: weeklyExercises.reduce((sum, item) => sum + item.burnedCalories, 0),
    doRuleSuccessRate,
    avoidRuleFailCount,
    weightStart,
    weightEnd,
    weightChange,
    topFoods: getTopFoods(weeklyFoods),
    dominantMealSection: getDominantMealSection(weeklyFoods),
    challenge: params.profile?.challenge ?? null,
    coachTone: params.profile?.coachTone ?? null,
  };
}

export function getWeeklyPatternLines(summary: WeeklyInsightSummary) {
  const lines: string[] = [];

  if (summary.daysLoggedFood === 0) {
    return [
      "이번 주는 아직 식단 기록이 거의 없어요.",
      "한 끼씩만 적어도 흐름을 읽기가 훨씬 쉬워져요.",
      "내일부터는 가장 자주 먹는 끼니 하나부터 가볍게 남겨봐요.",
    ];
  }

  if (summary.weightChange !== null) {
    if (summary.weightChange <= -0.3) {
      lines.push(`몸무게는 이번 주에 ${Math.abs(summary.weightChange)}kg 정도 내려가는 흐름이에요.`);
    } else if (summary.weightChange >= 0.3) {
      lines.push(`몸무게는 이번 주에 ${summary.weightChange}kg 정도 올라가는 흐름이에요.`);
    } else {
      lines.push("몸무게는 이번 주에 크게 흔들리지 않고 비교적 안정적으로 움직였어요.");
    }
  }

  if (summary.highCalorieDays >= 3) {
    lines.push(`목표 칼로리를 넘긴 날이 ${summary.highCalorieDays}일 있어서 섭취 기복이 조금 보여요.`);
  } else if (summary.averageCalories > 0) {
    lines.push(`기록한 날 기준 평균 섭취는 ${summary.averageCalories}kcal로 비교적 읽기 쉬운 흐름이에요.`);
  }

  if (summary.exerciseDays >= 3) {
    lines.push(`운동은 ${summary.exerciseDays}일, 총 ${summary.exerciseMinutes}분으로 꾸준한 편이에요.`);
  } else if (summary.exerciseDays > 0) {
    lines.push(`운동은 ${summary.exerciseDays}일 기록됐어요. 한두 번만 더 이어지면 훨씬 안정적인 루틴이 돼요.`);
  } else {
    lines.push("운동 기록은 아직 많지 않아요. 짧은 산책부터 붙이면 전체 흐름이 훨씬 좋아져요.");
  }

  if (summary.dominantMealSection) {
    lines.push(`가장 비중이 큰 끼니는 ${summary.dominantMealSection} 쪽이에요.`);
  }

  return lines.slice(0, 3);
}

export function generateRuleBasedWeeklyFeedback(summary: WeeklyInsightSummary) : WeeklyAiFeedback {
  const summaryLine =
    summary.daysLoggedFood === 0
      ? "이번 주는 아직 기록이 적어서 흐름을 읽는 단계예요."
      : summary.highCalorieDays >= 3
        ? "이번 주는 칼로리 기복이 조금 있었지만, 어디서 흔들리는지는 꽤 잘 보이기 시작했어요."
        : summary.exerciseDays >= 3
          ? "이번 주는 기록과 운동이 함께 살아 있어서 전체 흐름이 꽤 안정적으로 보여요."
          : "이번 주는 큰 무너짐 없이 기본 흐름을 읽을 수 있는 한 주였어요.";

  const goodJob: string[] = [];
  const watchOut: string[] = [];
  const nextAction: string[] = [];

  if (summary.daysLoggedFood >= 5) {
    goodJob.push(`식단 기록을 ${summary.daysLoggedFood}일 남겨서 패턴을 읽기 좋은 주였어요.`);
  }
  if (summary.exerciseDays >= 2) {
    goodJob.push(`운동을 ${summary.exerciseDays}일 이어간 점이 좋아요.`);
  }
  if (summary.doRuleSuccessRate >= 60) {
    goodJob.push(`해야 할 일 성공률이 ${summary.doRuleSuccessRate}%로 꽤 안정적이었어요.`);
  }
  if (summary.weightChange !== null && summary.weightChange < 0) {
    goodJob.push(`몸무게 흐름도 ${Math.abs(summary.weightChange)}kg 정도 가볍게 내려왔어요.`);
  }

  if (summary.highCalorieDays >= 3) {
    watchOut.push(`목표 칼로리를 넘긴 날이 ${summary.highCalorieDays}일 있었어요.`);
  }
  if (summary.dessertCount >= 3) {
    watchOut.push(`디저트 계열 기록이 ${summary.dessertCount}번 보여요.`);
  }
  if (summary.sweetDrinkCount >= 2) {
    watchOut.push(`달달한 음료가 ${summary.sweetDrinkCount}번 들어왔어요.`);
  }
  if (summary.alcoholCount >= 1) {
    watchOut.push(`술 기록이 보여서 다음 날 식욕 흐름까지 같이 흔들릴 수 있어요.`);
  }
  if (summary.deliveryFoodCount >= 2) {
    watchOut.push(`배달음식 비중이 조금 올라오고 있어요.`);
  }
  if (summary.avoidRuleFailCount >= 3) {
    watchOut.push(`피해야 할 일 실패가 ${summary.avoidRuleFailCount}번 있었어요.`);
  }

  if (summary.challenge === "단음식") {
    nextAction.push("다음 주엔 첫 디저트를 먹기 전에 물 한 컵부터 먼저 마셔봐요.");
  } else if (summary.challenge === "야식") {
    nextAction.push("다음 주엔 저녁 직후에 먹을 단백질 간식 하나를 미리 정해두면 야식이 줄기 쉬워요.");
  } else if (summary.challenge === "술 마시기") {
    nextAction.push("술 약속이 있는 날은 첫 잔 전에 물이나 제로 음료를 먼저 한 잔 넣어봐요.");
  } else if (summary.challenge === "움직이지 않기") {
    nextAction.push("하루 한 번 10분만 걷는 버튼을 정해두면 운동 진입이 훨씬 쉬워져요.");
  } else {
    nextAction.push("가장 흔들리는 한 지점만 골라서 다음 주엔 하나만 줄여봐요.");
  }

  if (summary.dominantMealSection === "저녁") {
    nextAction.push("저녁 비중이 큰 편이라면 오후 간식에 단백질을 먼저 넣어보는 게 좋아요.");
  } else if (summary.dominantMealSection === "간식") {
    nextAction.push("간식이 잦은 주엔 첫 간식을 먹기 전에 물 한 컵 규칙을 붙여보세요.");
  } else {
    nextAction.push("지금은 기록을 끊기지 않게 이어가는 것만으로도 충분히 좋아요.");
  }

  return {
    summary: summaryLine,
    goodJob: goodJob.slice(0, 2),
    watchOut: watchOut.slice(0, 2),
    nextAction: nextAction.slice(0, 2),
  };
}
