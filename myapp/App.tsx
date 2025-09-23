// App.tsx
import React from "react";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// 各画面コンポーネント
const HomeScreen = () => (
  <View className="flex-1 items-center justify-center">
    <Text>今月の使えるお金 & 残り日数</Text>
  </View>
);

const ExpenseScreen = () => (
  <View className="flex-1 items-center justify-center">
    <Text>支出入力画面</Text>
  </View>
);

const SettingsScreen = () => (
  <View className="flex-1 items-center justify-center">
    <Text>収入・固定費・貯金目標の設定</Text>
  </View>
);

const BudgetScreen = () => (
  <View className="flex-1 items-center justify-center">
    <Text>残り予算 & 貯金進捗</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "home";

            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "Expense") {
              iconName = "add-circle";
            } else if (route.name === "Settings") {
              iconName = "settings";
            } else if (route.name === "Budget") {
              iconName = "wallet";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#2f95dc",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Expense" component={ExpenseScreen} />
        <Tab.Screen name="Budget" component={BudgetScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
