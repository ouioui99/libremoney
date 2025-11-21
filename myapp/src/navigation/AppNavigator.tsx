// navigation/AppNavigator.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BottomTabNavigator from "./BottomTabNavigator";
import SavingsGoalScreen from "../screens/SavingsGoalScreen";
import ManageRegularIncomeScreen from "../screens/ManageRegularIncomeScreen";
import ManageRegularExpenseScreen from "../screens/ManageRegularExpenseScreen";
import OnboardingScreen from "../screens/OnboardingScreen"; // ← 追加

import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { theme } = useTheme();
  const c = colors[theme];

  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const launched = await AsyncStorage.getItem("isFirstLaunch");

        if (!launched) {
          setIsFirstLaunch(true);
          await AsyncStorage.setItem("isFirstLaunch", "true");
        }
      } catch (error) {
        console.log("Launch check error:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ローディング状態（判定中）
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ⭐ 初回起動なら Onboarding を最初に表示 */}
      {isFirstLaunch ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : null}

      {/* ⭐ 通常スタート画面（BottomTab） */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* 追加画面 */}
      <Stack.Screen name="SavingsGoal" component={SavingsGoalScreen} />
      <Stack.Screen
        name="manageRegulaIncome"
        component={ManageRegularIncomeScreen}
      />
      <Stack.Screen
        name="manageRegulaExpense"
        component={ManageRegularExpenseScreen}
      />
    </Stack.Navigator>
  );
}
