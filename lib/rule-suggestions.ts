export const SUGGESTED_DO_RULES = [
  "매끼 단백질 한 가지 챙기기",
  "하루 채소 2번 먹기",
  "식사를 15분 이상 천천히 하기",
  "식사 전에 물 한 잔 마시기",
  "하루 한 끼는 직접 차려 먹기",
  "하루 20분 이상 움직이기",
  "하루 7시간 이상 자기",
] as const;

export const SUGGESTED_AVOID_RULES = [
  "술 마시지 않기",
  "빵·면·과자 먹지 않기",
  "튀김 먹지 않기",
  "배부른데 더 먹지 않기",
  "식사 중 유튜브·TV 보지 않기",
  "끼니 거르고 한꺼번에 먹지 않기",
  "디저트 먹지 않기",
  "달달한 음료 먹지 않기",
  "저녁 식사 후 야식 먹지 않기",
] as const;

export const RULE_SUGGESTIONS = [
  ...SUGGESTED_DO_RULES.map((title) => ({ title, type: "do" as const })),
  ...SUGGESTED_AVOID_RULES.map((title) => ({ title, type: "avoid" as const })),
];
