import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import CalendarModal from "../components/CalenderModal";
import { Expense } from "../types/models";
import {
  editItemInStorage,
  getItemsFromStorage,
  removeItemFromStorage,
} from "../util/storageUtils";
import { STORAGE_KEYS } from "../util/constants";
import { Category } from "../types/models"; // カテゴリー型を追加（定義済み前提）
import CategorySelector from "./CategorySelector";
import {
  handleCategoryReorder,
  handleCategoryDelete,
  handleCategoryEditOnSave,
} from "../util/categoryUtils";

type Props = {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSave: (updated: Expense) => void;
  isIncome: boolean;
};

export default function EditExpenseModal({
  visible,
  expense,
  onClose,
  onSave,
  isIncome,
}: Props) {
  const { theme } = useTheme();
  const c = colors[theme];
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Expense[]>([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);

  const CATEGORY_STORAGE_KEYS = isIncome
    ? STORAGE_KEYS.INCOME_CATEGORIES
    : STORAGE_KEYS.EXPENSE_CATEGORIES;

  const EXPENSE_INCOME_STORAGE_KEYS = isIncome
    ? STORAGE_KEYS.INCOMES
    : STORAGE_KEYS.EXPENSES;

  const displayText = isIncome ? "収入" : "支出";

  // 編集対象データが変わるたびに反映
  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount));
      setMemo(expense.memo ?? "");
      setDate(expense.date);
    }
  }, [expense]);

  // カテゴリー一覧の読み込み
  useEffect(() => {
    (async () => {
      try {
        const storedCategories = await getItemsFromStorage<Category>(
          CATEGORY_STORAGE_KEYS
        );
        setCategories(storedCategories);

        const storedExpenses = await getItemsFromStorage<Expense>(
          EXPENSE_INCOME_STORAGE_KEYS
        );

        setSelectedCategory(
          storedCategories.find(
            (category) => category.id === expense?.categoryId
          )
        );

        setExpenses(storedExpenses);
      } catch (e) {
        console.error("カテゴリー読み込みエラー:", e);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert("エラー", "正しい金額を入力してください");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("エラー", "カテゴリーを選択してください");
      return;
    }
    if (!expense) return;

    const updatedExpense: Expense = {
      ...expense,
      amount: parseFloat(amount),
      memo,
      date,
      categoryId: selectedCategory.id,
    };

    try {
      await editItemInStorage<Expense>(
        EXPENSE_INCOME_STORAGE_KEYS,
        (item) => item.id === expense.id,
        updatedExpense
      );
      onSave(updatedExpense);
      onClose();
    } catch (e) {
      console.error("編集保存エラー:", e);
      Alert.alert("エラー", "保存に失敗しました");
    }
  };

  const handleDelete = () => {
    if (!expense) return;

    Alert.alert("確認", "この支出を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            // removeItemFromStorage を使用して削除
            const updatedExpenses = await removeItemFromStorage<Expense>(
              EXPENSE_INCOME_STORAGE_KEYS,
              (item) => item.id === expense.id
            );

            setExpenses(updatedExpenses); // モーダル内 state 更新
            onSave(expense); // 親コンポーネントにも反映
            onClose();
          } catch (e) {
            console.error("削除エラー:", e);
            Alert.alert("エラー", "削除に失敗しました");
          }
        },
      },
    ]);
  };

  if (!expense) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.4)", // ← ここで半透明の暗い背景
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{
              width: "90%",
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 5,
            }}
          >
            {/* ヘッダー */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: c.text, fontSize: 18, fontWeight: "bold" }}>
                {displayText}を編集
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={c.text} />
              </TouchableOpacity>
            </View>

            {/* 金額入力 */}
            <TextInput
              style={{
                backgroundColor: c.secondary,
                color: c.text,
                borderRadius: 8,
                padding: 12,
                fontSize: 18,
                marginBottom: 12,
              }}
              keyboardType="numeric"
              placeholder="金額を入力"
              placeholderTextColor={c.placeholder}
              value={amount}
              onChangeText={setAmount}
            />

            {/* 日付選択 */}
            <TouchableOpacity
              style={{
                backgroundColor: c.secondary,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: c.text, fontSize: 16 }}>{date}</Text>
              <Ionicons name="calendar-outline" size={20} color={c.text} />
            </TouchableOpacity>

            <CalendarModal
              visible={showDatePicker}
              date={date}
              onClose={() => setShowDatePicker(false)}
              onChange={(selected) => {
                setDate(selected);
                setShowDatePicker(false);
              }}
            />

            {/* カテゴリー選択 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={{ color: c.text, fontSize: 16 }}>カテゴリー</Text>

              <TouchableOpacity
                style={[
                  {
                    backgroundColor: c.secondary,
                    padding: 6,
                    borderRadius: 8,
                  },
                ]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={c.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={{
                    backgroundColor:
                      selectedCategory?.id === cat.id ? c.accent : c.secondary,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 20,
                    marginRight: 8,
                  }}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={{
                      color: selectedCategory?.id === cat.id ? "#fff" : c.text,
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* メモ入力 */}
            <TextInput
              style={{
                backgroundColor: c.secondary,
                color: c.text,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                minHeight: 60,
                textAlignVertical: "top",
                marginTop: 12,
              }}
              placeholder="メモを入力"
              placeholderTextColor={c.placeholder}
              multiline
              value={memo}
              onChangeText={setMemo}
            />

            {/* 保存ボタン */}
            <TouchableOpacity
              style={{
                backgroundColor: c.accent,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
                marginTop: 20,
              }}
              onPress={handleSave}
            >
              <Text
                style={{
                  color: c.textOnAccent,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                保存
              </Text>
            </TouchableOpacity>

            {/* 削除ボタン */}
            <TouchableOpacity
              style={{
                backgroundColor: c.error,
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
                marginTop: 12,
                marginBottom: 20,
              }}
              onPress={handleDelete}
            >
              <Text
                style={{
                  color: c.textOnAccent,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                削除
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
      {/* カテゴリーセレクター */}
      <CategorySelector
        categories={categories}
        setCategories={setCategories}
        selectedCategoryId={selectedCategory?.id}
        onSelect={(category: Category) => setSelectedCategory(category)}
        onReorder={handleCategoryReorder}
        onDelete={handleCategoryDelete}
        onEditSave={handleCategoryEditOnSave}
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        showCategoryListModal={showCategoryListModal}
        setShowCategoryListModal={setShowCategoryListModal}
        type={"expense"}
      />
    </Modal>
  );
}
