import type { DailyCheckIn, DeliveryType, ExerciseRecommendation, FeedingType } from "@/types/app";

interface ExerciseContext {
  postpartumDay: number;
  deliveryType?: DeliveryType;
  feedingType?: FeedingType;
  latestCheckIn?: DailyCheckIn;
}

interface ExerciseLibraryItem {
  id: string;
  phase: "early" | "adapt" | "stable" | "reset";
  title: string;
  durationMinutes: number;
  intensityLabel: string;
  focus: string;
  routine: string[];
  recoveryNote: string;
  minDay: number;
  maxDay: number;
  allowedForCSectionEarly?: boolean;
  avoidWhenScarSensitive?: boolean;
  avoidWhenAbdominalPressure?: boolean;
  avoidWhenPelvicFloorSensitive?: boolean;
}

const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  {
    id: "breath-walk-early",
    phase: "early",
    title: "호흡 정리 + 실내 걷기",
    durationMinutes: 8,
    intensityLabel: "매우 가볍게",
    focus: "순환 회복 · 통증 없는 움직임",
    routine: ["복식호흡 2분", "발목 펌프 1분", "실내 걷기 3-5분"],
    recoveryNote: "초기에는 운동 효과보다 편안한 순환과 호흡 리듬이 더 중요해요.",
    minDay: 0,
    maxDay: 7,
    allowedForCSectionEarly: true,
  },
  {
    id: "walk-pelvic-adapt",
    phase: "adapt",
    title: "가벼운 걷기 + 골반저 인지",
    durationMinutes: 12,
    intensityLabel: "가볍게",
    focus: "걷기 적응 · 골반저 회복",
    routine: ["천천히 걷기 5-7분", "골반저 인지 3분", "가벼운 어깨/등 스트레칭 2분"],
    recoveryNote: "적응기에는 짧게 끝내도 충분하고, 버겁지 않은 쪽이 더 잘 맞아요.",
    minDay: 8,
    maxDay: 21,
    avoidWhenPelvicFloorSensitive: false,
  },
  {
    id: "walk-core-stable",
    phase: "stable",
    title: "걷기 + 코어 복귀 준비",
    durationMinutes: 18,
    intensityLabel: "가볍게",
    focus: "가벼운 지구력 · 코어 복귀 준비",
    routine: ["걷기 10분", "골반저 리듬 3분", "브릿지/힙 틸트 3-5분"],
    recoveryNote: "안정기에도 복압이 과한 동작은 서두르지 않는 편이 좋아요.",
    minDay: 22,
    maxDay: 42,
    avoidWhenAbdominalPressure: true,
    avoidWhenScarSensitive: true,
  },
  {
    id: "walk-fullbody-reset",
    phase: "reset",
    title: "걷기 + 저강도 전신 루틴",
    durationMinutes: 30,
    intensityLabel: "보통",
    focus: "체력 회복 · 전신 리듬",
    routine: ["빠르지 않은 걷기 15분", "하체/등 중심 저강도 루틴 10분", "정리 스트레칭 5분"],
    recoveryNote: "리셋 단계에서도 강도보다 꾸준함과 몸 반응 확인이 중요해요.",
    minDay: 43,
    maxDay: 365,
  },
];

function getExerciseStageLabel(postpartumDay: number) {
  if (postpartumDay <= 7) return "회복 초기";
  if (postpartumDay <= 21) return "회복 적응기";
  if (postpartumDay <= 42) return "회복 안정기";
  return "리셋/감량 단계";
}

function getExerciseAppropriateness(postpartumDay: number, exerciseMinutes: number) {
  if (postpartumDay <= 14) {
    if (exerciseMinutes <= 5) return "appropriate" as const;
    if (exerciseMinutes <= 10) return "high" as const;
    return "high" as const;
  }

  if (postpartumDay <= 42) {
    if (exerciseMinutes >= 10 && exerciseMinutes <= 20) return "appropriate" as const;
    if (exerciseMinutes < 10) return "low" as const;
    return "high" as const;
  }

  if (exerciseMinutes >= 20 && exerciseMinutes <= 40) return "appropriate" as const;
  if (exerciseMinutes < 20) return "low" as const;
  return "high" as const;
}

export function getExerciseRange(postpartumDay: number, deliveryType?: DeliveryType) {
  if (postpartumDay <= 14) {
    return deliveryType === "c-section"
      ? { min: 3, optimal: 8, max: 12 }
      : { min: 5, optimal: 12, max: 20 };
  }

  if (postpartumDay <= 42) {
    return deliveryType === "c-section"
      ? { min: 8, optimal: 15, max: 25 }
      : { min: 10, optimal: 20, max: 35 };
  }

  return { min: 20, optimal: 35, max: 50 };
}

function getCurrentPhase(postpartumDay: number): ExerciseLibraryItem["phase"] {
  if (postpartumDay <= 7) return "early";
  if (postpartumDay <= 21) return "adapt";
  if (postpartumDay <= 42) return "stable";
  return "reset";
}

function pickExerciseLibraryItem(context: ExerciseContext) {
  const phase = getCurrentPhase(context.postpartumDay);
  const scarSensitive = (context.latestCheckIn?.scarDiscomfortLevel ?? 0) >= 6;
  const abdominalPressureSensitive = (context.latestCheckIn?.abdominalPressureLevel ?? 0) >= 6;
  const pelvicFloorSensitive = (context.latestCheckIn?.pelvicFloorDiscomfortLevel ?? 0) >= 6;

  return (
    EXERCISE_LIBRARY.find((item) => {
      if (item.phase !== phase) return false;
      if (context.postpartumDay < item.minDay || context.postpartumDay > item.maxDay) return false;
      if (scarSensitive && item.avoidWhenScarSensitive) return false;
      if (abdominalPressureSensitive && item.avoidWhenAbdominalPressure) return false;
      if (pelvicFloorSensitive && item.avoidWhenPelvicFloorSensitive) return false;
      if (
        context.deliveryType === "c-section" &&
        context.postpartumDay <= 14 &&
        item.allowedForCSectionEarly === false
      ) {
        return false;
      }
      return true;
    }) ?? EXERCISE_LIBRARY.find((item) => item.phase === phase) ?? EXERCISE_LIBRARY[0]
  );
}

export function scoreExerciseMinutes(postpartumDay: number, exerciseMinutes: number) {
  if (exerciseMinutes < 0) {
    return 0;
  }

  if (postpartumDay <= 14) {
    if (exerciseMinutes <= 5) return 100;
    if (exerciseMinutes <= 10) return 70;
    return 40;
  }

  if (postpartumDay <= 42) {
    if (exerciseMinutes >= 10 && exerciseMinutes <= 20) return 100;
    if (exerciseMinutes < 10) return 70;
    return 60;
  }

  if (exerciseMinutes >= 20 && exerciseMinutes <= 40) return 100;
  if (exerciseMinutes < 20) return 70;
  return 80;
}

export function getExerciseRecommendation({
  postpartumDay,
  deliveryType,
  feedingType,
  latestCheckIn,
}: ExerciseContext): ExerciseRecommendation {
  const stageLabel = getExerciseStageLabel(postpartumDay);
  const painLevel = latestCheckIn?.painLevel ?? 3;
  const bleedingLevel = latestCheckIn?.bleedingLevel ?? 2;
  const yesterdayMinutes = latestCheckIn?.exerciseMinutes ?? 0;
  const scarDiscomfortLevel = latestCheckIn?.scarDiscomfortLevel ?? 0;
  const abdominalPressureLevel = latestCheckIn?.abdominalPressureLevel ?? 0;
  const pelvicFloorDiscomfortLevel = latestCheckIn?.pelvicFloorDiscomfortLevel ?? 0;
  const appropriateness = getExerciseAppropriateness(postpartumDay, yesterdayMinutes);
  const libraryItem = pickExerciseLibraryItem({
    postpartumDay,
    deliveryType,
    feedingType,
    latestCheckIn,
  });

  const needsCaution =
    painLevel >= 6 ||
    bleedingLevel >= 5 ||
    scarDiscomfortLevel >= 6 ||
    abdominalPressureLevel >= 6 ||
    pelvicFloorDiscomfortLevel >= 6;
  const cSectionCaution = deliveryType === "c-section" && postpartumDay <= 21;
  const breastfeedingLoad = feedingType === "breastfeeding" ? "수유 부담도 함께 보고" : "몸 반응을 함께 보고";

  if (postpartumDay <= 7) {
    return {
      title: libraryItem.title,
      durationMinutes: cSectionCaution ? 6 : libraryItem.durationMinutes,
      intensityLabel: libraryItem.intensityLabel,
      tip: "초기 회복기에는 운동량보다 순환, 호흡, 통증 없는 움직임이 더 중요해요.",
      stageLabel,
      focus: libraryItem.focus,
      routine: libraryItem.routine,
      caution: needsCaution
        ? "통증이나 출혈이 올라오면 바로 중단하고 더 가볍게 가는 편이 좋아요."
        : cSectionCaution
          ? "제왕절개 초기라서 복부에 힘이 많이 들어가는 동작은 피하는 편이 좋아요."
          : undefined,
      recoveryNote: `${breastfeedingLoad} ${libraryItem.recoveryNote}`,
      exerciseReason:
        appropriateness === "high"
          ? "어제 운동량이 조금 강했을 수 있어서 오늘은 회복 중심으로 더 낮게 추천해요."
          : "산후 초반이라 운동 효과보다 몸을 편안하게 깨우는 동작이 더 잘 맞아요.",
      appropriateness,
    };
  }

  if (postpartumDay <= 21) {
    return {
      title: cSectionCaution ? "짧은 걷기 + 골반저 인지" : libraryItem.title,
      durationMinutes: cSectionCaution ? 10 : 12,
      intensityLabel: libraryItem.intensityLabel,
      tip: "회복 적응기에는 무리하지 않는 범위에서 걷기와 골반저 인지를 함께 보는 편이 좋아요.",
      stageLabel,
      focus: libraryItem.focus,
      routine: libraryItem.routine,
      caution: needsCaution
        ? "통증이나 출혈 신호가 있으면 걷기 시간을 줄이고 호흡 위주로 바꿔도 괜찮아요."
        : cSectionCaution
          ? "복부 당김이 느껴지면 보폭과 시간을 더 줄이는 편이 좋아요."
          : undefined,
      recoveryNote: libraryItem.recoveryNote,
      exerciseReason:
        appropriateness === "low"
          ? "어제 움직임이 조금 적어서 오늘은 부담 없는 걷기부터 다시 이어가도록 추천해요."
          : appropriateness === "high"
            ? "어제 운동이 조금 강했을 수 있어 오늘은 자극보다 회복 리듬을 우선으로 잡아요."
            : "현재 주차에는 10분 안팎의 가벼운 걷기와 골반저 자극이 가장 무난해요.",
      appropriateness,
    };
  }

  if (postpartumDay <= 42) {
    return {
      title: libraryItem.title,
      durationMinutes: deliveryType === "c-section" ? 15 : 18,
      intensityLabel: libraryItem.intensityLabel,
      tip: "회복 안정기에는 시간을 조금 늘릴 수 있지만, 복압이 과한 동작은 아직 서두르지 않는 편이 좋아요.",
      stageLabel,
      focus: libraryItem.focus,
      routine: libraryItem.routine,
      caution: needsCaution
        ? "출혈이나 통증이 다시 올라오면 브릿지 같은 코어 동작은 빼고 걷기만 해도 충분해요."
        : deliveryType === "c-section"
          ? "제왕절개라면 코어 동작은 통증 없는 범위에서 아주 작게 시작하는 편이 안전해요."
          : undefined,
      recoveryNote: libraryItem.recoveryNote,
      exerciseReason:
        appropriateness === "low"
          ? "최근 운동량이 조금 적어서 오늘은 회복을 해치지 않는 선에서 시간을 소폭 늘렸어요."
          : appropriateness === "high"
            ? "최근 운동량이 적정 범위를 넘었을 가능성이 있어 오늘은 강도를 한 단계 낮췄어요."
            : "현재 단계에서는 걷기와 가벼운 코어 복귀 준비가 가장 안정적인 조합이에요.",
      appropriateness,
    };
  }

  return {
    title: libraryItem.title,
    durationMinutes: libraryItem.durationMinutes,
    intensityLabel: libraryItem.intensityLabel,
    tip: "리셋 단계에서도 강도보다 꾸준함과 회복 반응 확인이 더 중요해요.",
    stageLabel,
    focus: libraryItem.focus,
    routine: libraryItem.routine,
    caution: painLevel >= 6 ? "통증이 남아 있다면 시간을 줄이고 회복기 루틴으로 한 단계 낮춰도 괜찮아요." : undefined,
    recoveryNote: libraryItem.recoveryNote,
    exerciseReason:
      appropriateness === "low"
        ? "최근 활동량이 조금 낮아서, 무리 없는 범위에서 조금 더 꾸준히 움직일 수 있게 추천해요."
        : appropriateness === "high"
          ? "최근 운동량이 많았을 수 있어서 오늘은 몸 반응을 보며 중간 강도로 조정해요."
          : "지금은 가벼운 전신 루틴과 걷기를 묶어 꾸준히 이어가기 좋은 단계예요.",
    appropriateness,
  };
}
