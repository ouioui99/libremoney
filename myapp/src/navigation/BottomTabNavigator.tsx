// navigation/BottomTabNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ExpenseScreen from "../screens/ExpenseScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HomeScreen from "../screens/HomeScreen";
import BudgetScreen from "../screens/BudgetScreen";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors"; // 👈 colors をインポート

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const { theme } = useTheme();
  const themeColors = theme === "dark" ? colors.dark : colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        borderTopColor: "red",
        borderTopWidth: 100,
        tabBarStyle: {
          backgroundColor: themeColors.background, // 👈 colors から取得
        },
        tabBarActiveTintColor: themeColors.accent, // 👈 colors から取得
        tabBarInactiveTintColor: themeColors.secondary, // 👈 colors から取得
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "ホーム") iconName = "home";
          else if (route.name === "登録") iconName = "add-circle";
          else if (route.name === "設定") iconName = "settings";
          else if (route.name === "データ") iconName = "wallet";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="ホーム" component={HomeScreen} />
      <Tab.Screen name="登録" component={ExpenseScreen} />
      <Tab.Screen name="データ" component={BudgetScreen} />
      <Tab.Screen name="設定" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
