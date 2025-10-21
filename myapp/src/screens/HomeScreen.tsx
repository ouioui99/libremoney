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
import { Category, Expense } from "../types/models";
import CategorySelector from "../components/CategorySelector";
import {
  handleCategoryDelete,
  handleCategoryEditOnSave,
  handleCategoryReorder,
} from "../util/categoryUtils";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const targetSavings = 500000;
  const remainingDays = 120;
  const todayUsable = 3500;
  const totalDays = 150;

  const [expense, setExpense] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const inputRef = useRef<TextInput>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category>(categories[0]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);

  const { theme } = useTheme();
  const c = colors[theme];

  const progress = (totalDays - remainingDays) / totalDays;

  useEffect(() => {
    (async () => {
      try {
        const storedExpenses = await getItemsFromStorage<Expense>(
          STORAGE_KEYS.EXPENSES
        );
        setExpenses(storedExpenses || []);

        const storedCategories = await getItemsFromStorage<Category>(
          STORAGE_KEYS.CATEGORIES
        );

        // order プロパティでソート
        const sorted = (storedCategories || []).slice().sort((a, b) => {
          const ao = Number(a.order ?? a.id ?? 0);
          const bo = Number(b.order ?? b.id ?? 0);
          return ao - bo;
        });
        setCategories(sorted);

        if (categories.length > 0 && !category) {
          setCategory(sorted[0]);
        }
      } catch (e) {
        console.error("支出データ読み込みエラー:", e);
      }
    })();
  }, []);

  const handleAddExpense = async () => {
    if (!expense || !category) return;
    try {
      const amount = parseFloat(expense);
      const newId = await getNextId(STORAGE_KEYS.EXPENSES);

      const newExpense = {
        id: newId,
        amount,
        date: new Date().toISOString().split("T")[0],
        categoryId: category.id,
      };

      const newExpenses = await addItemToStorage(
        STORAGE_KEYS.EXPENSES,
        expenses,
        newExpense
      );

      setExpenses(newExpenses);
      setExpense("");
      setCategory(categories[0]);
      inputRef.current?.blur();
    } catch (error) {
      console.error("保存エラー:", error);
      Alert.alert("エラー", "保存に失敗しました");
    }
  };

  /** ✅ カテゴリーごとの合計金額を算出 */
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    categories.forEach((cat) => (totals[cat.id] = 0));

    expenses.forEach((e) => {
      const catId = e.categoryId;
      if (catId && totals.hasOwnProperty(catId)) {
        totals[catId] += e.amount;
      }
    });

    return totals;
  }, [expenses, categories]);

  const maxAmount = Math.max(...Object.values(categoryTotals), 1);

  return (
    <SafeAreaLayout style={{ backgroundColor: c.background, flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* 今日使える金額 */}
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <Text style={[styles.label, { color: c.text }]}>今日使える金額</Text>
          <Text style={[styles.mainAmount, { color: c.accent }]}>
            ¥{todayUsable.toLocaleString()}
          </Text>
        </View>

        {/* 支出登録 */}
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
          </View>

          <View style={styles.buttonRow}>
            {categories.slice(0, 5).map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      category?.id === cat.id ? c.accent : c.secondary,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      fontSize: 14,
                      color: category?.id === cat.id ? "#fff" : c.text,
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.categoryButton, { backgroundColor: c.secondary }]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color={c.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: c.success }]}
            onPress={handleAddExpense}
          >
            <Text style={styles.buttonText}>登録</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ カテゴリー別支出 */}
        <View style={[styles.card, { backgroundColor: c.card, flex: 1 }]}>
          <Text style={[styles.label, { color: c.text, marginBottom: 12 }]}>
            カテゴリー別支出
          </Text>

          <FlatList
            data={categories}
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
        </View>

        {/* 目標貯金額 + 残り日数 */}
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <Text style={[styles.label, { color: c.text }]}>目標貯金額</Text>
          <Text style={[styles.subAmount, { color: c.text }]}>
            ¥{targetSavings.toLocaleString()}
          </Text>

          <Text style={[styles.label, { marginTop: 12, color: c.text }]}>
            残り日数
          </Text>
          <Text style={[styles.subAmount, { color: c.text }]}>
            {remainingDays}日
          </Text>

          <View
            style={[styles.progressContainer, { backgroundColor: c.secondary }]}
          >
            <View
              style={[
                styles.progressBar,
                { width: `${progress * 100}%`, backgroundColor: c.accent },
              ]}
            />
          </View>
        </View>
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
    marginRight: 8,
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
