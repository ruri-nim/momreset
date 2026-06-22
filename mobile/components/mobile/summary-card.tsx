import type { ReactNode } from "react";
import { Text, View } from "react-native";

export function SummaryCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: 28,
        borderWidth: 1,
        borderColor: "#f2c1b1",
        backgroundColor: "rgba(255, 250, 238, 0.96)",
        paddingHorizontal: 18,
        paddingVertical: 18,
        shadowColor: "#a37859",
        shadowOpacity: 0.1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "800",
          letterSpacing: 2,
          color: "#8b6a57",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </Text>
      <Text style={{ marginTop: 8, fontSize: 22, fontWeight: "900", color: "#2a1f18" }}>
        {title}
      </Text>
      <View style={{ marginTop: 14 }}>{children}</View>
    </View>
  );
}
