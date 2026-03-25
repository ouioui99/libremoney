import React, { useState, useMemo, useCallback } from "react";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
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
import { AD_UNIT_IDS } from "../../adConfig";

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = colors[theme];

  const [selectedTab, setSelectedTab] = useState<"expense" | "income">(
    "expense",
  );
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Expense[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayLocal());

  const adUnitId = AD_UNIT_IDS.BudgetScreen;

  // ✅ データ読み込み関数を再利用できるように外に出す
  const loadData = useCallback(async () => {
    try {
      const [
        storedExpenses,
        storedIncomes,
        storedExpenseCategories,
        storedIncomeCategories,
      ] = await Promise.all([
        getItemsFromStorage<Expense>(STORAGE_KEYS.EXPENSES),
        getItemsFromStorage<Expense>(STORAGE_KEYS.INCOMES),
        getItemsFromStorage<Category>(STORAGE_KEYS.EXPENSE_CATEGORIES),
        getItemsFromStorage<Category>(STORAGE_KEYS.INCOME_CATEGORIES),
      ]);

      setExpenses(storedExpenses);
      setIncomes(storedIncomes);
      setExpenseCategories(storedExpenseCategories);
      setIncomeCategories(storedIncomeCategories);
    } catch (e) {
      console.error("データ読み込みエラー:", e);
    }
  }, []);

  // ✅ フォーカス時に読み込み
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // ✅ 支出・収入ごとのマーク
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const list = selectedTab === "expense" ? expenses : incomes;

    list.forEach((e) => {
      if (!marks[e.date])
        marks[e.date] = { marked: true, dots: [{ color: c.accent }] };
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
  }, [expenses, incomes, selectedTab, selectedDate, c]);

  // ✅ 選択された日のデータ
  const filteredData = useMemo(() => {
    const list = selectedTab === "expense" ? expenses : incomes;
    return list.filter((e) => e.date === selectedDate);
  }, [selectedTab, expenses, incomes, selectedDate]);

  const categories =
    selectedTab === "expense" ? expenseCategories : incomeCategories;

  // ✅ モーダル保存時の処理
  const handleSave = async (updated: Expense) => {
    if (selectedTab === "expense") {
      setExpenses((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e)),
      );
    } else {
      setIncomes((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e)),
      );
    }

    // ストレージから再読み込み（即時反映）
    await loadData();
  };

  const dataWithAds = useMemo(() => {
    const result: any[] = [];

    filteredData.forEach((item, index) => {
      // 通常アイテム
      result.push({ type: "item", data: item });

      // 👇 3件目 or 7件ごとに広告
      if (index === 2 || (index > 2 && (index - 2) % 7 === 0)) {
        result.push({ type: "ad", id: `ad-${index}` });
      }
    });

    // 👇 最下部広告
    if (filteredData.length > 0) {
      result.push({ type: "ad", id: "ad-last" });
    }

    return result;
  }, [filteredData]);

  return (
    <SafeAreaLayout
      style={{ flex: 1, backgroundColor: c.background, paddingHorizontal: 16 }}
    >
      {/* トグル（タブ風） */}
      <View
        style={[
          styles.tabContainer,
          { marginTop: insets.top + 8, paddingHorizontal: 8 },
        ]}
      >
        <TouchableOpacity
          onPress={() => setSelectedTab("expense")}
          style={[
            styles.tabButton,
            {
              backgroundColor:
                selectedTab === "expense" ? c.expense : c.secondary,
            },
          ]}
        >
          <Text style={{ color: c.text }}>支出</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab("income")}
          style={[
            styles.tabButton,
            {
              backgroundColor:
                selectedTab === "income" ? c.income : c.secondary,
            },
          ]}
        >
          <Text style={{ color: c.text }}>収入</Text>
        </TouchableOpacity>
      </View>

      {/* カレンダー */}
      <Calendar
        key={theme}
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
        style={{ marginBottom: 12 }}
      />
      <View style={{ paddingHorizontal: 8 }}>
        {/* 一覧タイトル */}
        <Text style={[styles.label, { color: c.text, marginBottom: 8 }]}>
          {selectedDate} の{selectedTab === "expense" ? "支出" : "収入"}一覧
        </Text>
      </View>

      {/* 一覧 */}
      {filteredData.length === 0 ? (
        <View style={{ paddingHorizontal: 8 }}>
          <Text style={{ color: c.placeholder }}>
            この日の{selectedTab === "expense" ? "支出" : "収入"}はありません
          </Text>
        </View>
      ) : (
        <FlatList
          data={dataWithAds}
          keyExtractor={(item, index) =>
            item.type === "ad" ? item.id : item.data.id
          }
          renderItem={({ item, index }) => {
            // ======================
            // 広告
            // ======================
            if (item.type === "ad") {
              return (
                <View style={{ marginVertical: 8, alignItems: "center" }}>
                  <BannerAd
                    unitId={adUnitId}
                    size={BannerAdSize.MEDIUM_RECTANGLE}
                    requestOptions={{
                      requestNonPersonalizedAdsOnly: true,
                    }}
                  />
                </View>
              );
            }

            // ======================
            // 通常アイテム
            // ======================
            const expense = item.data;
            const category = getCategory(categories, expense.categoryId);

            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedExpense(expense);
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
                    <Text style={[styles.expenseText, { color: c.text }]}>
                      ¥{expense.amount.toLocaleString()}
                    </Text>
                    {category && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
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
                  <Text
                    style={{
                      color: c.placeholder,
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    📝 {expense.memo}
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
        onSave={handleSave}
        isIncome={selectedTab !== "expense"}
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
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
