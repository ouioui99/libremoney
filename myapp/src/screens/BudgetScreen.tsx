import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeAreaLayout from "../components/SafeAreaLayout";

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaLayout>
      <Text>This is top text.</Text>
      <Text>This is bottom text.</Text>
    </SafeAreaLayout>
  );
}
