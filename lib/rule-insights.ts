import { getDateKeyDaysAgo } from "@/lib/diet-app-date";
import type {
  DietFoodItem,
  ExerciseLogItem,
  RuleHistoryEntry,
  RuleItem,
} from "@/types/diet-app";

export interface RulePerformance {
  id: string;
  title: string;
  type: "do" | "avoid";
  successes: number;
  attempts: number;
  successRate: number;
}

export interface PersonalizedRuleRecommendation {
  title: string;
  type: "do" | "avoid";
  reason: string;
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
const deliveryKeywords = ["배달", "치킨", "피자", "떡볶이", "햄버거", "족발", "보쌈"];
const alcoholKeywords = ["술", "맥주", "소주", "와인", "칵테일", "하이볼"];

function includesKeyword(name: string, keywords: string[]) {
  return keywords.some((keyword) => name.includes(keyword));
}

function getRulePerformance(
  rules: RuleItem[],
  history: RuleHistoryEntry[],
  type: "do" | "avoid",
) {
  return rules
    .map((rule): RulePerformance => {
      const statuses = history
        .map((entry) =>
          type === "do"
            ? entry.doRuleStatuses[rule.id]
            : entry.avoidRuleStatuses[rule.id],
        )
        .filter((status) => status === "done" || status === "failed");
      const successes = statuses.filter((status) => status === "done").length;

      return {
        id: rule.id,
        title: rule.title,
        type,
        successes,
        attempts: statuses.length,
        successRate: statuses.length ? Math.round((successes / statuses.length) * 100) : 0,
      };
    })
    .filter((item) => item.attempts > 0);
}

export function getRulePerformanceHighlights(params: {
  doRules: RuleItem[];
  avoidRules: RuleItem[];
  history: RuleHistoryEntry[];
}) {
  const performances = [
    ...getRulePerformance(params.doRules, params.history, "do"),
    ...getRulePerformance(params.avoidRules, params.history, "avoid"),
  ];
  const best = [...performances].sort(
    (a, b) => b.successRate - a.successRate || b.attempts - a.attempts,
  )[0] ?? null;
  const hardest = [...performances].sort(
    (a, b) => a.successRate - b.successRate || b.attempts - a.attempts,
  )[0] ?? null;

  return { best, hardest, evaluatedRuleCount: performances.length };
}

export function getPersonalizedRuleRecommendations(params: {
  foods: DietFoodItem[];
  exerciseLogs: ExerciseLogItem[];
  ruleHistory: RuleHistoryEntry[];
  doRules: RuleItem[];
  avoidRules: RuleItem[];
  baseDate?: Date;
}) {
  const baseDate = params.baseDate ?? new Date();
  const dateKeys = Array.from({ length: 7 }, (_, index) =>
    getDateKeyDaysAgo(6 - index, baseDate),
  );
  const foods = params.foods.filter((item) => dateKeys.includes(item.loggedAt));
  const exercises = params.exerciseLogs.filter((item) =>
    dateKeys.includes(item.loggedAt ?? ""),
  );
  const histories = params.ruleHistory.filter((item) => dateKeys.includes(item.date));
  const recordedDays = new Set([
    ...foods.map((item) => item.loggedAt),
    ...exercises.map((item) => item.loggedAt ?? ""),
    ...histories
      .filter((item) =>
        [...Object.values(item.doRuleStatuses), ...Object.values(item.avoidRuleStatuses)]
          .some((status) => status === "done" || status === "failed"),
      )
      .map((item) => item.date),
  ]).size;

  if (recordedDays < 3) {
    return { recordedDays, recommendations: [] as PersonalizedRuleRecommendation[] };
  }

  const candidates: PersonalizedRuleRecommendation[] = [];
  const exerciseDays = new Set(exercises.map((item) => item.loggedAt)).size;
  const dessertCount = foods.filter((item) =>
    includesKeyword(item.name, dessertKeywords),
  ).length;
  const sweetDrinkCount = foods.filter((item) =>
    includesKeyword(item.name, sweetDrinkKeywords),
  ).length;
  const deliveryCount = foods.filter((item) =>
    includesKeyword(item.name, deliveryKeywords),
  ).length;
  const alcoholCount = foods.filter((item) =>
    includesKeyword(item.name, alcoholKeywords),
  ).length;
  const snackDays = new Set(
    foods.filter((item) => item.mealSection === "간식").map((item) => item.loggedAt),
  ).size;

  if (exerciseDays < 2) {
    candidates.push({
      title: "점심 후 15분 걷기",
      type: "do",
      reason: `최근 7일 운동 기록이 ${exerciseDays}일이라, 짧게 시작하기 좋은 규칙이에요.`,
    });
  }
  if (dessertCount >= 2) {
    candidates.push({
      title: "디저트 먹지 않기",
      type: "avoid",
      reason: `최근 7일 디저트 기록이 ${dessertCount}번 보여서 먼저 줄여보면 좋아요.`,
    });
  }
  if (sweetDrinkCount >= 2) {
    candidates.push({
      title: "달달한 음료 먹지 않기",
      type: "avoid",
      reason: `최근 7일 달달한 음료가 ${sweetDrinkCount}번 기록됐어요.`,
    });
  }
  if (deliveryCount >= 2) {
    candidates.push({
      title: "배달음식 먹지 않기",
      type: "avoid",
      reason: `최근 7일 배달음식으로 볼 수 있는 기록이 ${deliveryCount}번 있어요.`,
    });
  }
  if (alcoholCount >= 1) {
    candidates.push({
      title: "이번 주 술 마시지 않기",
      type: "avoid",
      reason: "최근 식단에 술이 기록되어 이번 주만 가볍게 쉬어보는 규칙이에요.",
    });
  }
  if (snackDays >= 3) {
    candidates.push({
      title: "간식은 하루 1번만 먹기",
      type: "avoid",
      reason: `최근 7일 중 ${snackDays}일에 간식 기록이 있어 횟수부터 조절해보면 좋아요.`,
    });
  }

  const existingTitles = new Set([
    ...params.doRules.map((item) => item.title),
    ...params.avoidRules.map((item) => item.title),
  ]);
  const recommendations = candidates
    .filter((item) => !existingTitles.has(item.title))
    .filter(
      (item, index, items) =>
        items.findIndex((candidate) => candidate.title === item.title) === index,
    )
    .slice(0, 3);

  return { recordedDays, recommendations };
}
