import { Text, View } from "react-native";
import { MobileScreen } from "@/components/mobile/mobile-screen";
import { SummaryCard } from "@/components/mobile/summary-card";
import { mobilePreviewData } from "@/lib/mobile-preview-data";

export default function ExerciseScreen() {
  return (
    <MobileScreen title="Exercise" subtitle="운동 기록과 보너스 흐름을 모바일에서 더 가볍게 볼 수 있어요.">
      <SummaryCard title="Today Exercise" eyebrow="Bonus">
        <Text style={{ fontSize: 32, fontWeight: "900", color: "#2a1f18" }}>
          {mobilePreviewData.exerciseCalories} kcal
        </Text>
        <Text style={{ marginTop: 10, fontSize: 15, lineHeight: 23, color: "#7b5f4c" }}>
          오늘 운동으로 소모한 칼로리 합계예요.
        </Text>
      </SummaryCard>

      <SummaryCard title="오늘 운동 미리보기" eyebrow="Logs">
        {mobilePreviewData.exercises.map((exercise) => (
          <View
            key={exercise.name}
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
            <Text style={{ fontSize: 16, fontWeight: "800", color: "#2a1f18" }}>{exercise.name}</Text>
            <Text style={{ marginTop: 4, fontSize: 13, color: "#8b6a57" }}>
              {exercise.minutes}분 · {exercise.calories} kcal
            </Text>
          </View>
        ))}
      </SummaryCard>
    </MobileScreen>
  );
}
