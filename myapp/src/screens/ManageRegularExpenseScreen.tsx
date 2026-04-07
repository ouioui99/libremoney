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
import EditRegularIncomeModal from "../components/EditRegularIncomeModal";
import { useSnackbar } from "../contexts/SnackbarContext";

export default function ManageRegularExpenseScreen({ navigation }: any) {
  const { theme } = useTheme();
  const c = colors[theme];

  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [addingCategory, setAddingCategory] = useState<Category>(); // 新規用
  const [editingCategory, setEditingCategory] = useState<Category>(); // 編集用

  const [expenses, setExpenses] = useState<RegularIncome[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);
  const [showCycleRuleSettingModal, setShowCycleRuleSettingModal] =
    useState(false);

  const [cycleRuleType, setCycleRuleType] = useState<CycleRule["type"]>();
  const [editingItem, setEditingItem] = useState<RegularIncome | null>(null);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

  // カテゴリ選択モーダルが「新規から呼ばれたか」「編集から呼ばれたか」を判定するフラグ
  const [isCategoryForEdit, setIsCategoryForEdit] = useState(false);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REGULARLY_EXPENSES);
      if (data) setExpenses(JSON.parse(data));
    } catch (e) {
      console.error("支出データの読み込みに失敗:", e);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSE_CATEGORIES);
      if (data) setCategories(JSON.parse(data));
    } catch (e) {
      console.error("カテゴリー読み込みエラー:", e);
    }
  };

  const saveExpenses = async (newList: RegularIncome[]) => {
    setExpenses(newList);
    await AsyncStorage.setItem(
      STORAGE_KEYS.REGULARLY_EXPENSES,
      JSON.stringify(newList),
    );
  };

  // 編集アイテムをクリックした時
  const onClickItem = (item: RegularIncome) => {
    setEditingItem(item);
    // 編集用Stateにそのアイテムのカテゴリをセット
    const currentCat = categories.find((c) => c.id === item.categoryId);
    setEditingCategory(currentCat);
    setEditModalVisible(true);
  };

  // 更新処理
  const handleUpdate = (
    id: string,
    amount: number,
    memo: string,
    categoryId: string,
    cycleRule: CycleRule["type"],
  ) => {
    const updated = expenses.map((item) =>
      item.id === id
        ? { ...item, amount, memo, categoryId, cycleRule: { type: cycleRule } }
        : item,
    );
    saveExpenses(updated);
    setEditModalVisible(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const filtered = expenses.filter((item) => item.id !== id);
    saveExpenses(filtered);
    setEditModalVisible(false);
    setEditingItem(null);

    showSnackbar("定期支出を削除しました");
  };

  const handlePressCategorySelectInEdit = () => {
    // 1. 編集モーダルを一旦閉じる（Modalの重複を避けるため）
    setEditModalVisible(false);
    // 2. カテゴリ選択モーダルを開く
    setShowCategoryModal(true);
  };

  // カテゴリ選択時の共通処理
  const handleCategorySelect = (category: Category) => {
    if (isCategoryForEdit) {
      setEditingCategory(category); // 編集中のカテゴリを更新
    } else {
      setAddingCategory(category); // 新規追加フォームのカテゴリを更新
    }
    setShowCategoryModal(false);

    // 編集モーダルから来ていた場合は、少し遅らせて編集モーダルを再表示
    if (isCategoryForEdit) {
      setTimeout(() => setEditModalVisible(true), 500);
    }
  };

  return (
    <SafeAreaLayout
      style={[styles.container, { backgroundColor: c.background }]}
    >
      {/* ヘッダー */}
      <CustumHeader
        title="定期支出設定"
        navigation={navigation}
        type="expense"
      />
      {/* 追加フォーム */}
      <RegularIncomeAndExpenseForm
        selectedCategory={addingCategory}
        setSelectedCategory={setAddingCategory as any}
        categories={categories}
        onPressCategorySelect={() => {
          setIsCategoryForEdit(false); // 新規用として開く
          setShowCategoryModal(true);
        }}
        onAdd={(amount, memo, categoryId, cycleRule) => {
          const newIncome: RegularIncome = {
            id: Date.now().toString(),
            amount,
            memo,
            categoryId,
            cycleRule: { type: cycleRule },
          };
          const updated = [...expenses, newIncome];
          saveExpenses(updated);
          setAddingCategory(undefined);
        }}
        type="expense"
      />

      {/* 支出一覧 */}
      <RegularIncomeAndExpenseList
        incomes={expenses}
        categories={categories}
        theme={theme}
        colors={c}
        onDelete={handleDelete}
        type="支出"
        onClickItem={(item) => onClickItem(item)}
      />

      {/* 編集用モーダル */}
      <EditRegularIncomeModal
        visible={editModalVisible}
        item={editingItem}
        categories={categories}
        type="expense"
        selectedCategory={editingCategory} // 編集用Stateを渡す
        setSelectedCategory={setEditingCategory as any}
        onPressCategorySelect={() => {
          setEditModalVisible(false); // 編集モーダルを隠す
          setIsCategoryForEdit(true); // 編集用として開くフラグを立てる
          setShowCategoryModal(true);
        }}
        onUpdate={handleUpdate}
        onClose={() => {
          setEditModalVisible(false);
          setEditingItem(null);
          // 編集が終わったら編集用Stateもクリア（新規側には影響しない）
          setEditingCategory(undefined);
        }}
        onDeleteItem={(id) => handleDelete(id)}
      />

      {/* カテゴリーセレクター */}
      <CategorySelector
        categories={categories}
        setCategories={setCategories}
        selectedCategoryId={categoryId}
        onSelect={handleCategorySelect}
        onReorder={handleCategoryReorder}
        onDelete={handleCategoryDelete}
        onEditSave={handleCategoryEditOnSave}
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={(visible) => {
          setShowCategoryModal(visible);
          // カテゴリ選択せずに閉じた場合も、編集モード中なら編集モーダルに戻す
          if (!visible && isCategoryForEdit) {
            setTimeout(() => setEditModalVisible(true), 500);
          }
        }}
        showCategoryListModal={showCategoryListModal}
        setShowCategoryListModal={setShowCategoryListModal}
        type="expense"
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
