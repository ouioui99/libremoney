import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";

export default function SavingsGoalScreen({ navigation }: any) {
  const { theme } = useTheme();
  const c = colors[theme];
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const today = new Date(); // ← 今日
  const handleConfirm = (date: Date) => {
    setDeadline(date);
    setDatePickerVisible(false);
  };

  const handleSave = () => {
    if (!amount || !deadline) return;
    console.log("保存:", {
      amount,
      deadline: deadline.toISOString().split("T")[0],
    });
    navigation.goBack();
  };

  return (
    <SafeAreaLayout
      style={[styles.container, { backgroundColor: c.background }]}
    >
      <Text style={[styles.title, { color: c.text }]}>貯金目標を設定</Text>

      {/* 金額入力 */}
      <TextInput
        style={[styles.input, { borderColor: c.border, color: c.text }]}
        placeholder="目標金額 (円)"
        placeholderTextColor={c.placeholder}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {/* 期限選択ボタン */}
      <TouchableOpacity
        style={[styles.input, styles.dateButton, { borderColor: c.border }]}
        onPress={() => setDatePickerVisible(true)}
      >
        <Text
          style={{
            color: deadline ? c.text : c.placeholder,
            fontSize: 16,
          }}
        >
          {deadline ? deadline.toISOString().split("T")[0] : "期限を選択"}
        </Text>
      </TouchableOpacity>

      {/* 日付ピッカー */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisible(false)}
        locale="ja"
        confirmTextIOS="決定"
        cancelTextIOS="キャンセル"
        minimumDate={today} // ✅ 今日より未来のみ選択可能
      />

      {/* 保存ボタン */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: amount && deadline ? c.accent : c.border },
        ]}
        disabled={!amount || !deadline}
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
  },
  dateButton: {
    justifyContent: "center",
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});
