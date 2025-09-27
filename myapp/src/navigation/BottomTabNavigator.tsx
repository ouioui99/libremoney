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

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Expense") iconName = "add-circle";
          else if (route.name === "Settings") iconName = "settings";
          else if (route.name === "Budget") iconName = "wallet";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Expense" component={ExpenseScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
