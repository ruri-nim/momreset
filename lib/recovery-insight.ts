import {
  calculateRecoveryAdjustmentBreakdown,
  getRecoveryStage,
  type RecoveryAdjustmentParams,
} from "@/lib/recovery-progress";

interface RecoveryProgressInsightParams extends RecoveryAdjustmentParams {
  postpartumDays: number;
  recoveryProgress: number;
}

function getPrimaryFocus(params: RecoveryAdjustmentParams) {
  const breakdown = calculateRecoveryAdjustmentBreakdown(params);
  const entries = Object.entries(breakdown).sort((left, right) => left[1] - right[1]);
  const [weakest] = entries;

  switch (weakest?.[0]) {
    case "sleep":
      return "수면";
    case "pain":
      return "통증 관리";
    case "bleeding":
      return "출혈 안정";
    case "exercise":
      return "운동 강도";
    case "nutrition":
      return "영양";
    case "logging":
      return "기록 꾸준함";
    default:
      return undefined;
  }
}

export function generateRecoveryProgressInsight(
  params: RecoveryProgressInsightParams,
) {
  const stage = getRecoveryStage(params.postpartumDays);
  const focus = getPrimaryFocus(params);
  const breakdown = calculateRecoveryAdjustmentBreakdown(params);
  const totalAdjustment =
    breakdown.sleep +
    breakdown.pain +
    breakdown.bleeding +
    breakdown.exercise +
    breakdown.nutrition +
    breakdown.logging;

  const stageSentence =
    stage === "회복 초기"
      ? "회복 초기 단계예요."
      : stage === "회복 적응기"
        ? "회복 적응기에 들어선 흐름이에요."
        : stage === "회복 안정기"
          ? "회복 안정기에 가까워지고 있어요."
          : "이제는 리셋과 감량까지 함께 보는 단계예요.";

  const flowSentence =
    totalAdjustment >= 4
      ? "현재 흐름은 비교적 안정적이에요."
      : totalAdjustment <= -5
        ? "최근 회복 신호가 조금 느린 편이에요."
        : "최근 회복 흐름은 무리 없이 이어지고 있어요.";

  const focusSentence = focus
    ? `${focus} 쪽을 조금 더 보완하면 더 편안한 흐름으로 이어질 수 있어요.`
    : "지금처럼 무리하지 않는 페이스를 유지해보세요.";

  return `${stageSentence} Recovery Progress는 ${params.recoveryProgress}%예요. ${flowSentence} ${focusSentence}`;
}
