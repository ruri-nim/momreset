import { Text, View } from "react-native";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { SummaryCard } from "@/components/mobile/summary-card";
import { mobilePreviewData } from "@/lib/mobile-preview-data";

export default function FoodScreen() {
  return (
    <MobileScreen title="Food" subtitle="모바일에서는 오늘 먹은 흐름부터 빠르게 볼 수 있어요.">
      <SummaryCard title="Today Intake" eyebrow="Calories">
        <Text style={{ fontSize: 32, fontWeight: "900", color: "#2a1f18" }}>
          {mobilePreviewData.intakeCalories} kcal
        </Text>
        <Text style={{ marginTop: 10, fontSize: 15, lineHeight: 23, color: "#7b5f4c" }}>
          목표 {mobilePreviewData.goalCalories} kcal 중 기록된 섭취량이에요.
        </Text>
      </SummaryCard>

      <SummaryCard title="오늘 기록 미리보기" eyebrow="Meals">
        {mobilePreviewData.foods.map((food) => (
          <View
            key={food.name}
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#f2c1b1",
              backgroundColor: "rgba(255,255,255,0.8)",
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginTop: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#2a1f18" }}>{food.name}</Text>
            <Text style={{ marginTop: 4, fontSize: 13, color: "#8b6a57" }}>
              {food.section} · {food.calories} kcal
            </Text>
          </View>
        ))}
      </SummaryCard>
    </MobileScreen>
  );
}
