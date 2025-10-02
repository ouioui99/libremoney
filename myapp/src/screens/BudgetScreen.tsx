import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeAreaLayout from "../components/SafeAreaLayout";
import { colors } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";

type Expense = {
  id: string;
  amount: number;
  date: string;
};

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();

  const [expense, setExpense] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const inputRef = useRef<TextInput>(null);

  const { theme } = useTheme();
  const c = colors[theme];

  const handleAddExpense = () => {
    if (!expense) return;

    const newExpense: Expense = {
      id: String(Date.now()),
      amount: parseInt(expense),
      date: new Date().toLocaleDateString(),
    };

    setExpenses([newExpense, ...expenses]);
    setExpense("");
    inputRef.current?.blur();
  };

  return (
    <SafeAreaLayout
      style={{ flex: 1, paddingHorizontal: 16, backgroundColor: c.background }}
    >
      {/* 支出入力 */}
      <View style={[styles.inputCard, { backgroundColor: c.card }]}>
        <Text style={[styles.label, { color: c.text }]}>支出を登録</Text>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { borderColor: c.border, color: c.text }]}
            placeholder="金額を入力"
            placeholderTextColor={c.placeholder}
            keyboardType="numeric"
            value={expense}
            onChangeText={setExpense}
          />
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: c.accent, marginLeft: 8 },
            ]}
            onPress={handleAddExpense}
          >
            <Text style={styles.buttonText}>登録</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 支出一覧 */}
      <Text
        style={[
          styles.label,
          { color: c.text, marginTop: 20, marginBottom: 8 },
        ]}
      >
        支出一覧
      </Text>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        style={{ flex: 1 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.expenseItem,
              {
                backgroundColor: c.secondary,
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 12,
              },
            ]}
          >
            <Text style={[styles.expenseText, { color: c.text }]}>
              {item.date}
            </Text>
            <Text style={[styles.expenseText, { color: c.text }]}>
              ¥{item.amount.toLocaleString()}
            </Text>
          </View>
        )}
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  inputCard: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  expenseItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseText: {
    fontSize: 16,
  },
});
