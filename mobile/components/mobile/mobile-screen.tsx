import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";

export function MobileScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff7b3" }}
      contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 22, paddingBottom: 120, gap: 16 }}
    >
      <View
        style={{
          borderRadius: 34,
          borderWidth: 1,
          borderColor: "#f2c1b1",
          backgroundColor: "rgba(255,252,241,0.95)",
          paddingHorizontal: 20,
          paddingVertical: 18,
          shadowColor: "#a37859",
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
        }}
      >
        <Text
          style={{
            fontSize: 34,
            fontWeight: "900",
            color: "#2a1f18",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            marginTop: 10,
            fontSize: 15,
            lineHeight: 24,
            color: "#7b5f4c",
          }}
        >
          {subtitle}
        </Text>
      </View>

      {children}
    </ScrollView>
  );
}
