import React, { useState, useEffect } from "react";
import { StyleSheet, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";
import CustumHeader from "../components/CustomHeader";
import CategorySelector from "../components/CategorySelector";
import {
  handleCategoryDelete,
  handleCategoryEditOnSave,
  handleCategoryReorder,
} from "../util/categoryUtils";
import { STORAGE_KEYS } from "../util/constants";
import { Category, CycleRule, RegularIncome } from "../types/models";
import CycleRuleSettingModal from "../components/CycleRuleSettingModal";
import RegularIncomeAndExpenseForm from "../components/RegularIncomeAndExpenseForm";
import RegularIncomeAndExpenseList from "../components/RegularIncomeAndExpenseList";

export default function ManageRegularIncomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const c = colors[theme];

  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<RegularIncome[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);
  const [showCycleRuleSettingModal, setShowCycleRuleSettingModal] =
    useState(false);

  const [cycleRuleType, setCycleRuleType] = useState<CycleRule["type"]>();

  useEffect(() => {
    loadIncomes();
    loadCategories();
  }, []);

  const loadIncomes = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REGULARLY_INCOMES);
      if (data) setIncomes(JSON.parse(data));
    } catch (e) {
      console.error("収入データの読み込みに失敗:", e);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INCOME_CATEGORIES);
      if (data) setCategories(JSON.parse(data));
    } catch (e) {
      console.error("カテゴリー読み込みエラー:", e);
    }
  };

  const saveIncomes = async (newList: RegularIncome[]) => {
    setIncomes(newList);
    await AsyncStorage.setItem(
      STORAGE_KEYS.REGULARLY_INCOMES,
      JSON.stringify(newList)
    );
  };

  const handleAdd = () => {
    if (!amount) return Alert.alert("入力エラー", "金額を入力してください。");
    if (!cycleRuleType)
      return Alert.alert("入力エラー", "サイクルルールを設定してください");

    const newIncome: RegularIncome = {
      id: Date.now().toString(),
      amount: Number(amount),
      memo,
      categoryId,
      cycleRule: { type: cycleRuleType },
    };

    const updated = [...incomes, newIncome];
    saveIncomes(updated);
    setAmount("");
    setMemo("");
    setCategoryId("");
  };

  const handleDelete = (id: string) => {
    Alert.alert("削除確認", "この収入を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          const filtered = incomes.filter((item) => item.id !== id);
          saveIncomes(filtered);
        },
      },
    ]);
  };

  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  return (
    <SafeAreaLayout
      style={[styles.container, { backgroundColor: c.background }]}
    >
      {/* ヘッダー */}
      <CustumHeader
        title="定期収入設定"
        navigation={navigation}
        type="income"
      />
      {/* 追加フォーム */}
      <RegularIncomeAndExpenseForm
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={categories}
        onPressCategorySelect={() => setShowCategoryModal(true)} // 👈 追加
        onAdd={(amount, memo, categoryId, cycleRule) => {
          const newIncome: RegularIncome = {
            id: Date.now().toString(),
            amount,
            memo,
            categoryId,
            cycleRule: { type: cycleRule },
          };
          const updated = [...incomes, newIncome];
          saveIncomes(updated);
        }}
      />

      {/* 支出一覧 */}
      <RegularIncomeAndExpenseList
        incomes={incomes}
        categories={categories}
        theme={theme}
        colors={c}
        onDelete={handleDelete}
        type="収入"
      />

      {/* カテゴリーセレクター */}
      <CategorySelector
        categories={categories}
        setCategories={setCategories}
        selectedCategoryId={categoryId}
        onSelect={(id: string) => setCategoryId(id)}
        onReorder={handleCategoryReorder}
        onDelete={handleCategoryDelete}
        onEditSave={handleCategoryEditOnSave}
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        showCategoryListModal={showCategoryListModal}
        setShowCategoryListModal={setShowCategoryListModal}
        type="income"
      />
      <CycleRuleSettingModal
        visible={showCycleRuleSettingModal}
        onClose={() => setShowCycleRuleSettingModal(false)}
        onSave={(rule) => {
          setCycleRuleType(rule);
        }}
        initialCycle={cycleRuleType}
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  card: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontSize: 15, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Platform.OS === "ios" ? 10 : 8,
    fontSize: 16,
    marginTop: 4,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cycleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  itemText: { fontSize: 16, fontWeight: "600" },
  incomeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  incomeLeft: {
    flex: 1,
    marginRight: 8,
  },
  memoText: {
    fontSize: 16,
    fontWeight: "600",
  },

  incomeRight: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  cycleText: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    padding: 6,
  },
  incomeItem: {
    flexDirection: "column",
    borderRadius: 0, // ← 並んだ時に自然に見えるよう角丸を外す
    paddingVertical: 10,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
