// screens/HomeScreen.tsx
import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";
import { useTheme } from "../contexts/ThemeContext";
import { STORAGE_KEYS } from "../util/constant";
import {
  addItemToStorage,
  getItemsFromStorage,
  getNextId,
} from "../util/storageUtils";
import { Category, Expense, SavingsGoal } from "../types/models";
import CategorySelector from "../components/CategorySelector";
import {
  handleCategoryDelete,
  handleCategoryEditOnSave,
  handleCategoryReorder,
} from "../util/categoryUtils";
import { Ionicons } from "@expo/vector-icons";
import {
  calculateRemainingDays,
  calculateTotalDays,
  getTodayLocal,
} from "../util/dateUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const todayUsable = 3500;

  const [expense, setExpense] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingGoal, setSavingGoal] = useState<SavingsGoal>();
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [totalDays, setTotalDays] = useState<number>(0);
  const inputRef = useRef<TextInput>(null);

  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [displaiedCategories, setDisplaiedCategories] = useState<Category[]>(
    []
  );
  const [categoryId, setCategoryId] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);

  const [isIncomeMode, setIsIncomeMode] = useState(false);
  const targetStorageKey = isIncomeMode
    ? STORAGE_KEYS.INCOMES
    : STORAGE_KEYS.EXPENSES;

  const { theme } = useTheme();
  const c = colors[theme];

  useEffect(() => {
    //開発用
    // AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify([]));
    // AsyncStorage.setItem(STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify([]));
    // AsyncStorage.setItem("categories", JSON.stringify([]));
    // AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));

    (async () => {
      try {
        const storedExpenses = await getItemsFromStorage<Expense>(
          STORAGE_KEYS.EXPENSES
        );
        setExpenses(storedExpenses || []);

        const storedExpenseCategories = await getItemsFromStorage<Category>(
          STORAGE_KEYS.EXPENSE_CATEGORIES
        );

        const storeIncomeCategories = await getItemsFromStorage<Category>(
          STORAGE_KEYS.INCOME_CATEGORIES
        );

        const storedSavingGoal = await getItemsFromStorage<SavingsGoal>(
          STORAGE_KEYS.SAVING_GOAL
        );

        // order プロパティでソート
        const sortedExpenseCategories = (storedExpenseCategories || [])
          .slice()
          .sort((a, b) => {
            const ao = Number(a.order ?? a.id ?? 0);
            const bo = Number(b.order ?? b.id ?? 0);
            return ao - bo;
          });

        const sortedIncomeCategories = (storeIncomeCategories || [])
          .slice()
          .sort((a, b) => {
            const ao = Number(a.order ?? a.id ?? 0);
            const bo = Number(b.order ?? b.id ?? 0);
            return ao - bo;
          });

        if (sortedExpenseCategories.length > 0) {
          setExpenseCategories(sortedExpenseCategories);
        }

        if (sortedIncomeCategories.length > 0) {
          setIncomeCategories(sortedIncomeCategories);
        }

        if (storedSavingGoal.length > 0) {
          const savingGoal = storedSavingGoal[0];
          setSavingGoal(savingGoal);
          const calculatedRemainingDays = calculateRemainingDays(
            savingGoal.deadline
          );
          setRemainingDays(calculatedRemainingDays);

          const totalDays = calculateTotalDays(
            savingGoal.deadline,
            savingGoal.createdAt
          );
          setTotalDays(totalDays);
        }

        if (isIncomeMode) {
          setDisplaiedCategories(sortedIncomeCategories);
        } else {
          setDisplaiedCategories(sortedExpenseCategories);
        }
      } catch (e) {
        console.error("支出データ読み込みエラー:", e);
      }
    })();
  }, [isIncomeMode, showCategoryListModal]);

  const handleAddExpenseOrIncome = async () => {
    if (!expense || !selectedCategory) return;
    try {
      const amount = parseFloat(expense);
      const newId = await getNextId(STORAGE_KEYS.EXPENSES);

      const newItem = {
        id: newId,
        amount,
        date: getTodayLocal(),
        categoryId: selectedCategory.id,
      };

      const newItems = await addItemToStorage(
        targetStorageKey,
        expenses,
        newItem
      );

      setExpenses(newItems);
      setExpense("");
      setSelectedCategory(undefined);
      inputRef.current?.blur();

      Alert.alert(
        "保存完了",
        `${isIncomeMode ? "収入" : "支出"}を保存しました`
      );
    } catch (error) {
      console.error("保存エラー:", error);
      Alert.alert("エラー", "保存に失敗しました");
    }
  };

  const progress = (totalDays - remainingDays) / totalDays;

  /** ✅ カテゴリーごとの合計金額を算出 */
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenseCategories.forEach((cat) => (totals[cat.id] = 0));

    expenses.forEach((e) => {
      const catId = e.categoryId;
      if (catId && totals.hasOwnProperty(catId)) {
        totals[catId] += e.amount;
      }
    });

    return totals;
  }, [expenses, expenseCategories]);

  const maxAmount = Math.max(...Object.values(categoryTotals), 1);

  return (
    <SafeAreaLayout style={{ backgroundColor: c.background, flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* 今日使える金額 */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.card, { backgroundColor: c.card }]}>
            <Text style={[styles.label, { color: c.text }]}>
              今日使える金額
            </Text>
            <Text style={[styles.mainAmount, { color: c.accent }]}>
              ¥{todayUsable.toLocaleString()}
            </Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* 支出登録 */}
          <View style={[styles.inputCard, { backgroundColor: c.card }]}>
            {/* トグルスイッチ */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => setIsIncomeMode(false)}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: !isIncomeMode ? c.income : c.secondary,
                  marginRight: 4,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: !isIncomeMode ? "#fff" : c.text }}>
                  支出
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsIncomeMode(true)}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: isIncomeMode ? c.income : c.secondary,
                  marginLeft: 4,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: isIncomeMode ? "#fff" : c.text }}>
                  収入
                </Text>
              </TouchableOpacity>
            </View>

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
            </View>

            <View style={styles.buttonRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }} // 端の余白を少し追加
              >
                {displaiedCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          selectedCategory?.id === cat.id
                            ? c.accent
                            : c.secondary,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          fontSize: 14,
                          color:
                            selectedCategory?.id === cat.id ? "#fff" : c.text,
                        },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    { backgroundColor: c.secondary },
                  ]}
                  onPress={() => setShowCategoryModal(true)}
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color={c.text}
                  />
                </TouchableOpacity>
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: isIncomeMode ? c.income : c.expense },
              ]}
              onPress={handleAddExpenseOrIncome}
            >
              <Text style={styles.buttonText}>登録</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
        {/* 目標貯金額 + 残り日数 */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.card, { backgroundColor: c.card }]}>
            <Text style={[styles.label, { color: c.text }]}>目標貯金額</Text>
            <Text style={[styles.subAmount, { color: c.text }]}>
              ¥{savingGoal?.amount.toLocaleString()}
            </Text>

            <Text style={[styles.label, { marginTop: 12, color: c.text }]}>
              残り日数
            </Text>
            <Text style={[styles.subAmount, { color: c.text }]}>
              {remainingDays}日
            </Text>

            <View
              style={[
                styles.progressContainer,
                { backgroundColor: c.secondary },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  { width: `${progress * 100}%`, backgroundColor: c.accent },
                ]}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
        {/* ✅ カテゴリー別支出 */}
        {/* <View style={[styles.card, { backgroundColor: c.card, flex: 1 }]}>
          <Text style={[styles.label, { color: c.text, marginBottom: 12 }]}>
            カテゴリー別支出
          </Text>

          <FlatList
            data={expenseCategories}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.barRow}>
                <Text style={[styles.subAmount, { width: 60, color: c.text }]}>
                  {item.name}
                </Text>
                <View
                  style={[
                    styles.barBackground,
                    { backgroundColor: c.secondary },
                  ]}
                >
                  <View
                    style={{
                      width: `${(categoryTotals[item.id] / maxAmount) * 100}%`,
                      backgroundColor: c.accent,
                      height: "100%",
                      borderRadius: 5,
                    }}
                  />
                </View>
                <Text
                  style={[
                    styles.subAmount,
                    { width: 70, textAlign: "right", color: c.text },
                  ]}
                >
                  ¥{categoryTotals[item.id]?.toLocaleString?.() ?? "0"}
                </Text>
              </View>
            )}
          />
        </View> */}
        {/* カテゴリーセレクター */}
        <CategorySelector
          categories={isIncomeMode ? incomeCategories : expenseCategories}
          setCategories={
            isIncomeMode ? setIncomeCategories : setExpenseCategories
          }
          selectedCategoryId={categoryId}
          onSelect={(id: string) => setCategoryId(id)}
          onReorder={handleCategoryReorder}
          onDelete={handleCategoryDelete}
          onEditSave={handleCategoryEditOnSave}
          showCategoryModal={showCategoryModal}
          setShowCategoryModal={setShowCategoryModal}
          showCategoryListModal={showCategoryListModal}
          setShowCategoryListModal={setShowCategoryListModal}
          type={isIncomeMode ? "income" : "expense"}
        />
      </View>
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  label: {
    fontSize: 17,
    fontWeight: "500",
  },
  mainAmount: {
    fontSize: 40,
    fontWeight: "700",
  },
  subAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputCard: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 8,
  },
  button: {
    alignSelf: "stretch",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  barBackground: {
    flex: 1,
    height: 16,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  progressContainer: {
    marginTop: 16,
    height: 10,
    width: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
});
