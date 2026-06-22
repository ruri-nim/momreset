import { Text, View } from "react-native";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { SummaryCard } from "@/components/mobile/summary-card";
import { mobilePreviewData } from "@/lib/mobile-preview-data";

export default function ProgressScreen() {
  return (
    <MobileScreen title="My Progress" subtitle="몸무게와 주간 피드백을 앱 버전으로 옮기는 첫 화면이에요.">
      <SummaryCard title="이번 주 흐름" eyebrow="Weekly">
        <Text style={{ fontSize: 16, lineHeight: 24, color: "#7b5f4c" }}>
          {mobilePreviewData.weeklySummary}
        </Text>
      </SummaryCard>

      <SummaryCard title="위젯 데이터 후보" eyebrow="Widget">
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 15, color: "#2a1f18" }}>
            순 칼로리: {mobilePreviewData.netCalories} / {mobilePreviewData.goalCalories}
          </Text>
          <Text style={{ fontSize: 15, color: "#2a1f18" }}>
            해야 할 일: {mobilePreviewData.doDone} / {mobilePreviewData.doTotal}
          </Text>
          <Text style={{ fontSize: 15, color: "#2a1f18" }}>
            피해야 할 일: {mobilePreviewData.avoidSuccess} / {mobilePreviewData.avoidTotal}
          </Text>
        </View>
      </SummaryCard>
    </MobileScreen>
  );
}
