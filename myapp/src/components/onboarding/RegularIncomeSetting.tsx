import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Alert,
  Platform,
  View,
  Text,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../contexts/ThemeContext";
import { colors } from "../../theme/colors";
import { Category, RegularIncome, CycleRule } from "../../types/models";
import {
  handleCategoryReorder,
  handleCategoryDelete,
  handleCategoryEditOnSave,
} from "../../util/categoryUtils";
import { STORAGE_KEYS } from "../../util/constants";
import CategorySelector from "../CategorySelector";
import CycleRuleSettingModal from "../CycleRuleSettingModal";
import RegularIncomeAndExpenseForm from "../RegularIncomeAndExpenseForm";
import RegularIncomeAndExpenseList from "../RegularIncomeAndExpenseList";
import SafeAreaLayout from "../SafeAreaLayout";

const { width } = Dimensions.get("window");

export default function RegularIncomeSetting({ navigation }: any) {
  const { theme } = useTheme();
  const c = colors[theme];

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();
  const [expenses, setExpenses] = useState<RegularIncome[]>([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);
  const [showCycleRuleModal, setShowCycleRuleModal] = useState(false);

  const [cycleRuleType, setCycleRuleType] = useState<CycleRule["type"]>();

  /** 初期読み込み */
  useEffect(() => {
    loadExpenses();
    loadCategories();
  }, []);

  /** 定期収入の読み込み */
  const loadExpenses = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REGULARLY_INCOMES);
      if (data) setExpenses(JSON.parse(data));
    } catch (error) {
      console.error("収入データの読み込みに失敗:", error);
    }
  };

  /** カテゴリーの読み込み */
  const loadCategories = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INCOME_CATEGORIES);
      if (data) setCategories(JSON.parse(data));
    } catch (error) {
      console.error("カテゴリーの読み込みに失敗:", error);
    }
  };

  /** 定期収入の保存 */
  const saveExpenses = async (list: RegularIncome[]) => {
    setExpenses(list);
    await AsyncStorage.setItem(
      STORAGE_KEYS.REGULARLY_INCOMES,
      JSON.stringify(list)
    );
  };

  /** 削除処理 */
  const handleDelete = (id: string) => {
    Alert.alert("削除確認", "この収入を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          const filtered = expenses.filter((item) => item.id !== id);
          saveExpenses(filtered);
        },
      },
    ]);
  };

  return (
    <SafeAreaLayout style={[styles.container, { backgroundColor: c.card }]}>
      <View style={{ width: "100%", alignItems: "center" }}>
        <Text style={[styles.title, { color: c.text }]}>
          定期的な収入を設定しよう
        </Text>

        <Text style={[styles.description, { color: c.text }]}>
          定期的な収入を入力してください。{"\n"}
          後から設定することも可能です。{"\n"}
        </Text>
      </View>

      {/* ------- 追加フォーム ---------- */}
      <RegularIncomeAndExpenseForm
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        categories={categories}
        onPressCategorySelect={() => setShowCategoryModal(true)}
        onAdd={(amount, memo, categoryId, cycleRule) => {
          const newItem: RegularIncome = {
            id: Date.now().toString(),
            amount,
            memo,
            categoryId,
            cycleRule: { type: cycleRule },
          };
          const updated = [...expenses, newItem];
          saveExpenses(updated);
        }}
        type="income"
      />

      {/* ------- 一覧表示 ---------- */}
      {/* <RegularIncomeAndExpenseList
        incomes={expenses}
        categories={categories}
        theme={theme}
        colors={c}
        onDelete={handleDelete}
        type="収入"
      /> */}

      {/* ------- カテゴリー管理 ---------- */}
      <CategorySelector
        categories={categories}
        setCategories={setCategories}
        selectedCategoryId={selectedCategory?.id ?? ""}
        onSelect={(category: Category) => setSelectedCategory(category)}
        onReorder={handleCategoryReorder}
        onDelete={handleCategoryDelete}
        onEditSave={handleCategoryEditOnSave}
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        showCategoryListModal={showCategoryListModal}
        setShowCategoryListModal={setShowCategoryListModal}
        type="income"
      />

      {/* ------- サイクルルール設定 ---------- */}
      <CycleRuleSettingModal
        visible={showCycleRuleModal}
        onClose={() => setShowCycleRuleModal(false)}
        onSave={(rule) => setCycleRuleType(rule)}
        initialCycle={cycleRuleType}
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },

  description: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 320,
    marginBottom: -32,
  },
});
