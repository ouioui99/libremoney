// screens/SavingsGoalScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";

export default function SavingsGoalScreen({ navigation }: any) {
  const { theme } = useTheme();
  const c = colors[theme];
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSave = () => {
    console.log("保存:", { amount, deadline });
    navigation.goBack();
  };

  return (
    <SafeAreaLayout
      style={[styles.container, { backgroundColor: c.background }]}
    >
      <Text style={[styles.title, { color: c.text }]}>貯金目標を設定</Text>

      <TextInput
        style={[styles.input, { borderColor: c.border, color: c.text }]}
        placeholder="目標金額 (円)"
        placeholderTextColor={c.placeholder}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={[styles.input, { borderColor: c.border, color: c.text }]}
        placeholder="期限 (例: 2025-12-31)"
        placeholderTextColor={c.placeholder}
        value={deadline}
        onChangeText={setDeadline}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.accent }]}
        onPress={handleSave}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>保存</Text>
      </TouchableOpacity>
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});
