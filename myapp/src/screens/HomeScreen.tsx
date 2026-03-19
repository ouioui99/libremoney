// screens/HomeScreen.tsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";
import { useTheme } from "../contexts/ThemeContext";
import { STORAGE_KEYS } from "../util/constants";
import {
  addItemToStorage,
  getItemsFromStorage,
  getNextId,
} from "../util/storageUtils";
import { Category, Expense, RegularIncome, SavingsGoal } from "../types/models";
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
import {
  calculateTodayUsableAmount,
  calculateUsableAmountParDay,
} from "../util/displayUtils";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import TrackingModal from "../components/TrackingModal";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";

export default function HomeScreen() {
  const [expense, setExpense] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Expense[]>([]);
  const [savingGoal, setSavingGoal] = useState<SavingsGoal>();
  const [remainingDays, setRemainingDays] = useState<number>(0);
  const [totalDays, setTotalDays] = useState<number>(0);
  const inputRef = useRef<TextInput>(null);

  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [displaiedCategories, setDisplaiedCategories] = useState<Category[]>(
    [],
  );
  const [categoryId, setCategoryId] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);
  const [showError, setShowError] = useState(false);

  const [calculatedTodayUsableAmount, setCalculatedTodayUsableAmount] =
    useState(0);

  const [isIncomeMode, setIsIncomeMode] = useState(false);
  const targetStorageKey = isIncomeMode
    ? STORAGE_KEYS.INCOMES
    : STORAGE_KEYS.EXPENSES;

  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const { theme } = useTheme();
  const c = colors[theme];

  const adUnitId = "ca-app-pub-3940256099942544/6300978111";

  const handleAllow = async () => {
    await requestTrackingPermissionsAsync();
    await AsyncStorage.setItem("trackingAsked", "true");
    setShowTrackingModal(false);
  };

  useEffect(() => {
    const check = async () => {
      const asked = await AsyncStorage.getItem("trackingAsked");
      if (!asked) setShowTrackingModal(true);
    };
    check();
  }, []);

  //カテゴリーと収支モード変換
  useEffect(() => {
    //開発用
    // AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CATEGORIES, JSON.stringify([]));
    // AsyncStorage.setItem(STORAGE_KEYS.INCOME_CATEGORIES, JSON.stringify([]));
    // AsyncStorage.setItem("categories", JSON.stringify([]));
    // AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    // AsyncStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify([]));

    (async () => {
      try {
        const storedExpenses = await getItemsFromStorage<Expense>(
          STORAGE_KEYS.EXPENSES,
        );

        const storedIncomes = await getItemsFromStorage<Expense>(
          STORAGE_KEYS.INCOMES,
        );

        setExpenses(storedExpenses);
        setIncomes(storedIncomes);

        const storedExpenseCategories = await getItemsFromStorage<Category>(
          STORAGE_KEYS.EXPENSE_CATEGORIES,
        );

        const storeIncomeCategories = await getItemsFromStorage<Category>(
          STORAGE_KEYS.INCOME_CATEGORIES,
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

  const fetchAndCalculate = async () => {
    try {
      const storedExpenses = await getItemsFromStorage<Expense>(
        STORAGE_KEYS.EXPENSES,
      );
      const storedIncomes = await getItemsFromStorage<Expense>(
        STORAGE_KEYS.INCOMES,
      );
      const storedSavingGoal = await getItemsFromStorage<SavingsGoal>(
        STORAGE_KEYS.SAVING_GOAL,
      );
      const storedRegularyIncomes = await getItemsFromStorage<RegularIncome>(
        STORAGE_KEYS.REGULARLY_INCOMES,
      );
      const storedRegularyExpenses = await getItemsFromStorage<RegularIncome>(
        STORAGE_KEYS.REGULARLY_EXPENSES,
      );

      if (storedSavingGoal.length > 0) {
        const savingGoal = storedSavingGoal[0];
        setSavingGoal(savingGoal);

        const calculatedRemainingDays = calculateRemainingDays(
          savingGoal.deadline,
        );
        setRemainingDays(calculatedRemainingDays);

        const totalDays = calculateTotalDays(
          savingGoal.deadline,
          savingGoal.createdAt,
        );
        setTotalDays(totalDays);

        const calculatedUsableAmountParDay = calculateUsableAmountParDay(
          savingGoal.amount,
          storedRegularyExpenses,
          storedRegularyIncomes,
          calculatedRemainingDays,
        );

        const calculatedTodayUsableAmount = calculateTodayUsableAmount(
          calculatedUsableAmountParDay,
          storedExpenses,
          storedIncomes,
          savingGoal.createdAt,
        );

        setCalculatedTodayUsableAmount(calculatedTodayUsableAmount);
      }
    } catch (e) {
      console.error("支出データ読み込みエラー:", e);
    }
  };

  // 画面フォーカス時に実行
  useFocusEffect(
    useCallback(() => {
      fetchAndCalculate();
    }, []),
  );

  // remainingDays, expenses, incomes に依存して再計算
  useEffect(() => {
    fetchAndCalculate();
  }, [remainingDays, expenses, incomes]);

  const isValid =
    !isNaN(Number(expense)) &&
    expense.trim() !== "" &&
    selectedCategory !== null &&
    1 < Number(expense);

  const handleAddExpenseOrIncome = async () => {
    if (!expense || !selectedCategory || !isValid) {
      setShowError(!isValid);
      return;
    }
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
        isIncomeMode ? incomes : expenses,
        newItem,
      );

      setExpenses(newItems);
      setExpense("");
      setSelectedCategory(undefined);
      inputRef.current?.blur();

      Alert.alert(
        "保存完了",
        `${isIncomeMode ? "収入" : "支出"}を保存しました`,
      );
    } catch (error) {
      console.error("保存エラー:", error);
      Alert.alert("エラー", "保存に失敗しました");
    }
  };

  const progress = (totalDays - remainingDays) / totalDays;

  /** ✅ カテゴリーごとの合計金額を算出 */
  // const categoryTotals = useMemo(() => {
  //   const totals: Record<string, number> = {};
  //   expenseCategories.forEach((cat) => (totals[cat.id] = 0));

  //   expenses.forEach((e) => {
  //     const catId = e.categoryId;
  //     if (catId && totals.hasOwnProperty(catId)) {
  //       totals[catId] += e.amount;
  //     }
  //   });

  //   return totals;
  // }, [expenses, expenseCategories]);

  // const maxAmount = Math.max(...Object.values(categoryTotals), 1);

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
              ¥{calculatedTodayUsableAmount.toLocaleString()}
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
                onPress={() => {
                  setIsIncomeMode(false);
                  setSelectedCategory(undefined);
                }}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: !isIncomeMode ? c.expense : c.secondary,
                  marginRight: 4,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: c.text }}>支出</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsIncomeMode(true);
                  setSelectedCategory(undefined);
                }}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: isIncomeMode ? c.income : c.secondary,
                  marginLeft: 4,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: c.text }}>収入</Text>
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
            {showError && expense.trim() !== "" && isNaN(Number(expense)) && (
              <Text style={[styles.errorText]}>
                目標金額は数字で入力してください
              </Text>
            )}

            <View style={styles.buttonRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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
                {
                  backgroundColor:
                    !selectedCategory || !expense
                      ? c.secondary // 無効時はグレー背景
                      : isIncomeMode
                        ? c.income
                        : c.expense,
                  opacity: !selectedCategory || !expense ? 0.5 : 1, // 視覚的に無効化
                },
              ]}
              onPress={handleAddExpenseOrIncome}
              disabled={!selectedCategory || !expense} // ←無効化条件
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color:
                      !selectedCategory || !expense ? c.placeholder : "#fff", // 無効時は淡い文字
                  },
                ]}
              >
                登録
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
        {/* 目標貯金額 + 残り日数 */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 16,
              marginVertical: 8,
              shadowColor: "#000",
              shadowOpacity: theme === "light" ? 0.05 : 0.3,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3, // Android用
            }}
          >
            {/* タイトル */}
            <Text
              style={{
                color: c.text,
                fontSize: 16,
                fontWeight: "700",
                marginBottom: 12,
              }}
            >
              現在の貯金目標
            </Text>

            {/* 目標貯金額 */}
            <Text
              style={{
                color: c.text,
                fontSize: 14,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              目標貯金額
            </Text>
            <Text
              style={{
                color: c.text,
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              ¥{savingGoal?.amount.toLocaleString()}
            </Text>

            {/* 目標期限 */}
            {savingGoal?.deadline && (
              <>
                <Text
                  style={{
                    color: c.placeholder,
                    fontSize: 12,
                    marginBottom: 2,
                  }}
                >
                  目標期限
                </Text>
                <Text
                  style={{
                    color: c.text,
                    fontSize: 14,
                    fontWeight: "500",
                    marginBottom: 8,
                  }}
                >
                  {new Date(savingGoal.deadline).toLocaleDateString()}
                </Text>
              </>
            )}

            {/* 残り日数 */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text style={{ color: c.text, fontSize: 14 }}>残り日数</Text>
              <Text
                style={{ color: c.accent, fontSize: 14, fontWeight: "600" }}
              >
                {remainingDays}日
              </Text>
            </View>

            {/* プログレスバー */}
            <View
              style={{
                height: 10,
                borderRadius: 5,
                backgroundColor: c.secondary,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${progress * 100}%`,
                  height: "100%",
                  backgroundColor: c.accent,
                }}
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
          onSelect={(category: Category) => setSelectedCategory(category)}
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
      <View style={{ marginVertical: 10, alignItems: "center" }}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.LARGE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
      <TrackingModal
        visible={showTrackingModal}
        onAllow={handleAllow}
        onSkip={() => setShowTrackingModal(false)}
      />
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
  errorText: {
    marginTop: 6,
    fontSize: 14,
    color: "red",
  },
});
