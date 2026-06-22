import { Text, View } from "react-native";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { SummaryCard } from "@/components/mobile/summary-card";
import { mobilePreviewData } from "@/lib/mobile-preview-data";

export default function RulesScreen() {
  return (
    <MobileScreen title="Rules" subtitle="해야 할 일과 피해야 할 일을 모바일에서도 바로 확인할 수 있어요.">
      <SummaryCard title="오늘 규칙 요약" eyebrow="OK / X">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: "#8b6a57" }}>해야 할 일</Text>
            <Text style={{ marginTop: 6, fontSize: 28, fontWeight: "900", color: "#2a1f18" }}>
              {mobilePreviewData.doDone}/{mobilePreviewData.doTotal}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: "#8b6a57" }}>피해야 할 일</Text>
            <Text style={{ marginTop: 6, fontSize: 28, fontWeight: "900", color: "#2a1f18" }}>
              {mobilePreviewData.avoidSuccess}/{mobilePreviewData.avoidTotal}
            </Text>
          </View>
        </View>
      </SummaryCard>

      <SummaryCard title="추천 위젯 미리보기" eyebrow="Widget idea">
        <Text style={{ fontSize: 15, lineHeight: 24, color: "#7b5f4c" }}>
          정사각형 위젯에는 오늘 칼로리 요약을 크게, 해야 할 일과 피해야 할 일 달성 수를 작게 넣는 구성이 잘 어울려요.
        </Text>
      </SummaryCard>
    </MobileScreen>
  );
}
