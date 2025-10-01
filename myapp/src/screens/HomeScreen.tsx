import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SafeAreaLayout from "../components/SafeAreaLayout";

export default function HomeScreen() {
  const targetSavings = 500000;
  const remainingDays = 120;
  const todayUsable = 3500;

  return (
    <SafeAreaLayout>
      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.label}>今日使える金額</Text>
        <Text style={styles.mainAmount}>¥{todayUsable.toLocaleString()}</Text>
      </View>

      {/* 目標貯金額 */}
      <Text style={styles.subText}>
        目標貯金額: ¥{targetSavings.toLocaleString()}
      </Text>

      {/* 残り日数 */}
      <Text style={styles.subText}>残り日数: {remainingDays}日</Text>
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4, // Android用
  },
  label: {
    fontSize: 18,
    color: "#555",
    marginBottom: 8,
  },
  mainAmount: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  subText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 6,
    textAlign: "center",
  },
});
