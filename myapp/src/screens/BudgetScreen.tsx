import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { useFocusEffect } from "@react-navigation/native";
import SafeAreaLayout from "../components/SafeAreaLayout";
import { colors } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";
import { STORAGE_KEYS } from "../util/constants";
import { getItemsFromStorage } from "../util/storageUtils";
import EditExpenseModal from "../components/EditExpenseModal";
import { Expense, Category } from "../types/models";
import { getCategory } from "../util/displayUtils";
import { Ionicons } from "@expo/vector-icons";
import { getTodayLocal } from "../util/dateUtils";

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = colors[theme];

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayLocal());

  // ✅ 画面表示時・フォーカス時に支出＆カテゴリーを読み込み
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [
            storedExpenses,
            storedExpenseCategories,
            storedIncomeCategories,
          ] = await Promise.all([
            getItemsFromStorage<Expense>(STORAGE_KEYS.EXPENSES),
            getItemsFromStorage<Category>(STORAGE_KEYS.EXPENSE_CATEGORIES),
            getItemsFromStorage<Category>(STORAGE_KEYS.INCOME_CATEGORIES),
          ]);
          setExpenses(storedExpenses);
          setExpenseCategories(storedExpenseCategories);
          setIncomeCategories(storedIncomeCategories);
        } catch (e) {
          console.error("データ読み込みエラー:", e);
        }
      };
      loadData();
    }, [])
  );

  // ✅ 支出がある日付にドットを付ける
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    expenses.forEach((e) => {
      if (!marks[e.date]) {
        marks[e.date] = {
          marked: true,
          dots: [{ color: c.accent }],
        };
      }
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: c.accent,
        selectedTextColor: "#fff",
      };
    }

    return marks;
  }, [expenses, selectedDate, c]);

  // ✅ 選択された日の支出のみ
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
        markingType="multi-dot"
        markedDates={markedDates}
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
          renderItem={({ item, index }) => {
            const category = getCategory(expenseCategories, item.categoryId);

            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedExpense(item);
                  setShowEditModal(true);
                }}
              >
                <View
                  style={[
                    styles.expenseItem,
                    {
                      backgroundColor:
                        index % 2 !== 0
                          ? c.card
                          : theme === "dark"
                          ? `${c.secondary}60`
                          : `${c.secondary}90`,
                      flexDirection: "column",
                      paddingHorizontal: 12,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* 金額 */}
                    <Text style={[styles.expenseText, { color: c.text }]}>
                      ¥{item.amount.toLocaleString()}
                    </Text>
                    {category && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4, // ← アイコンとテキストの間に少し余白
                        }}
                      >
                        <Ionicons
                          name={category.icon}
                          size={18}
                          color={c.accent}
                        />
                        <Text
                          style={[styles.categoryText, { color: c.accent }]}
                        >
                          {category.name}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* メモ */}
                  <Text
                    style={{
                      color: c.placeholder,
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    📝 {item.memo}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* 編集モーダル */}
      <EditExpenseModal
        visible={showEditModal}
        expense={selectedExpense}
        onClose={() => setShowEditModal(false)}
        onSave={(updated) => {
          setExpenses((prev) =>
            prev.map((e) => (e.id === updated.id ? updated : e))
          );
        }}
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  expenseItem: {
    paddingVertical: 8,
  },
  expenseText: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
