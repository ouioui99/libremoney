// navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "./BottomTabNavigator";
import SavingsGoalScreen from "../screens/SavingsGoalScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* 下部タブを含むメインナビゲーション */}
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      {/* 追加した画面 */}
      <Stack.Screen
        name="SavingsGoal"
        component={SavingsGoalScreen}
        options={{ title: "貯金目標を設定" }}
      />
    </Stack.Navigator>
  );
}
