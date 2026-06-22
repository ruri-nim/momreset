import { Text, View } from "react-native";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { SummaryCard } from "@/components/mobile/summary-card";
import { mobilePreviewData } from "@/lib/mobile-preview-data";

export default function HomeScreen() {
  return (
    <MobileScreen title="Home" subtitle="오늘 흐름을 한눈에 보는 모바일 버전이에요.">
      <SummaryCard title="오늘 한눈에" eyebrow="Daily OK">
        <Text style={{ fontSize: 30, fontWeight: "900", color: "#2a1f18" }}>☺️ 미소 흐름</Text>
        <Text style={{ marginTop: 10, fontSize: 16, lineHeight: 24, color: "#7b5f4c" }}>
          {mobilePreviewData.todaySummary}
        </Text>
      </SummaryCard>

      <SummaryCard title="오늘 요약" eyebrow="Stats">
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: "#8b6a57" }}>섭취 - 운동</Text>
            <Text style={{ marginTop: 6, fontSize: 28, fontWeight: "900", color: "#2a1f18" }}>
              {mobilePreviewData.netCalories}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: "#8b6a57" }}>OK / X / +</Text>
            <Text style={{ marginTop: 6, fontSize: 28, fontWeight: "900", color: "#2a1f18" }}>
              {mobilePreviewData.okCount}/{mobilePreviewData.xCount}/{mobilePreviewData.bonusCount}
            </Text>
          </View>
        </View>
      </SummaryCard>
    </MobileScreen>
  );
}
