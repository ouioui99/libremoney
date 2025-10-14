import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import SafeAreaLayout from "../components/SafeAreaLayout";
import { colors } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";
import { STORAGE_KEYS } from "../util/constant";
import { getItemsFromStorage } from "../util/storageUtils";

type Expense = {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
};

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = colors[theme];

  const inputRef = useRef<TextInput>(null);

  const [expense, setExpense] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // 起動時に過去の支出を読み込み
  useEffect(() => {
    (async () => {
      try {
        const storedExpenses = await getItemsFromStorage<Expense>(
          STORAGE_KEYS.EXPENSES
        );
        console.log(storedExpenses);

        setExpenses(storedExpenses);
      } catch (e) {
        console.error("支出データ読み込みエラー:", e);
      }
    })();
  }, []);

  // ✅ 選択された日の支出のみ抽出
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => e.date === selectedDate);
  }, [expenses, selectedDate]);

  return (
    <SafeAreaLayout
      style={{ flex: 1, backgroundColor: c.background, paddingHorizontal: 16 }}
    >
      {/* カレンダー */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: c.accent,
            selectedTextColor: "#fff",
          },
        }}
        theme={{
          backgroundColor: c.background,
          calendarBackground: c.card,
          textSectionTitleColor: c.text,
          monthTextColor: c.text,
          dayTextColor: c.text,
          todayTextColor: c.accent,
          arrowColor: c.accent,
        }}
        style={{
          borderRadius: 12,
          marginBottom: 12,
          marginTop: insets.top,
        }}
      />

      {/* 支出一覧 */}
      <Text
        style={[
          styles.label,
          { color: c.text, marginTop: 20, marginBottom: 8 },
        ]}
      >
        {selectedDate} の支出一覧
      </Text>

      {filteredExpenses.length === 0 ? (
        <Text style={{ color: c.placeholder }}>この日の支出はありません</Text>
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
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
                ¥{item.amount.toLocaleString()}
              </Text>
              <Text style={[styles.expenseText, { color: c.placeholder }]}>
                {item.date}
              </Text>
            </View>
          )}
        />
      )}
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
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  expenseText: {
    fontSize: 16,
  },
});
