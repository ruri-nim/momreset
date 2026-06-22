import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const iconMap = {
  index: "home",
  food: "restaurant",
  exercise: "barbell",
  rules: "checkbox",
  progress: "stats-chart",
} as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#ff7d6d",
        tabBarInactiveTintColor: "#8b6a57",
        tabBarStyle: {
          backgroundColor: "#fff9ef",
          borderTopColor: "#f2c1b1",
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={iconMap[route.name as keyof typeof iconMap]}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="food" options={{ title: "Food" }} />
      <Tabs.Screen name="exercise" options={{ title: "Exercise" }} />
      <Tabs.Screen name="rules" options={{ title: "Rules" }} />
      <Tabs.Screen name="progress" options={{ title: "My Progress" }} />
    </Tabs>
  );
}
