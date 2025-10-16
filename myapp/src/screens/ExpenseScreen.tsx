import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SafeAreaLayout from "../components/SafeAreaLayout";
import CalendarModal from "../components/CalenderModal";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import CategoryModal from "../components/CategoryModal";
import CategoryListModal from "../components/CategoryListModal";
import CategoryEditModal from "../components/CategoryEditModal";
import {
  addItemToStorage,
  editItemInStorage,
  getItemsFromStorage,
  getNextId,
  removeItemFromStorage,
} from "../util/storageUtils";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { STORAGE_KEYS } from "../util/constant";
import { Category, Expense, NewCategoryInput } from "../types/models";
import { getCategory } from "../util/displayUtils";

const buttons = [
  ["⌫", "AC", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

// 型ガード関数
const isCategory = (v: NewCategoryInput | Category): v is Category => {
  return (v as Category).id !== undefined && (v as Category).id !== "";
};

const displayConfirmBtn = "登録";

export default function ExpenseScreen() {
  const [expression, setExpression] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryId, setCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [memo, setMemo] = useState("");

  const { theme } = useTheme();
  const c = colors[theme];

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 起動時に過去の支出を読み込み
  useEffect(() => {
    (async () => {
      try {
        const storedExpenses = await getItemsFromStorage<Expense>(
          STORAGE_KEYS.EXPENSES
        );
        setExpenses(storedExpenses);

        const storedCategories = await getItemsFromStorage<Category>(
          STORAGE_KEYS.CATEGORIES
        );
        //テスト用
        //AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));

        // order プロパティでソートして state にセット
        const sorted = storedCategories.slice().sort((a, b) => {
          const ao = Number(a.order ?? a.id ?? 0);
          const bo = Number(b.order ?? b.id ?? 0);
          return ao - bo;
        });
        setCategories(sorted);
      } catch (e) {
        console.error("支出データ読み込みエラー:", e);
      }
    })();
  }, []);

  // 電卓ボタン押下処理
  const handlePress = (val: string) => {
    if (expression === "Error" && val !== "AC" && val !== "C") {
      if (/[0-9.]/.test(val)) {
        setExpression(val === "." ? "0." : val);
        return;
      } else if (["÷", "×", "−", "+", "%", "±"].includes(val)) {
        return;
      }
    }

    if (val === "AC" || val === "C") {
      setExpression("");
      if (val === "AC") setCalculating(false);
      return;
    }

    if (val === "⌫") {
      setExpression(expression.slice(0, -1));
      if (expression.slice(0, -1) === "") setCalculating(false);
    } else if (val === "=") {
      try {
        if (expression === "") return;
        let exp = expression;
        const lastChar = exp.slice(-1);
        if (["÷", "×", "−", "+"].includes(lastChar)) exp = exp.slice(0, -1);
        if (exp === "") return;
        if (/÷0/.test(exp)) throw new Error("0で割ることはできません");

        const replaced = exp
          .replace(/÷/g, "/")
          .replace(/×/g, "*")
          .replace(/−/g, "-");
        const result = eval(replaced);
        if (!isFinite(result)) throw new Error("無効な計算");

        setExpression(String(result));
        setCalculating(false);
      } catch {
        setExpression("Error");
      }
    } else if (val === "±") {
      const parts = expression.split(/÷|×|−|\+/);
      const lastNumber = parts.pop();
      if (!lastNumber) return;
      const newLast = lastNumber.startsWith("-")
        ? lastNumber.slice(1)
        : "-" + lastNumber;
      const newExpr = parts.join("") + newLast;
      setExpression(newExpr);
    } else if (["÷", "×", "−", "+"].includes(val)) {
      if (expression === "") return;
      const lastChar = expression.slice(-1);
      if (["÷", "×", "−", "+"].includes(lastChar)) {
        setExpression(expression.slice(0, -1) + val);
      } else {
        setExpression(expression + val);
      }
      setCalculating(true);
    } else if (val === ".") {
      const parts = expression.split(/÷|×|−|\+/);
      const currentNumber = parts[parts.length - 1];
      if (currentNumber.includes(".")) return;
      if (currentNumber === "") setExpression(expression + "0.");
      else setExpression(expression + ".");
    } else if (val === "0") {
      const parts = expression.split(/÷|×|−|\+/);
      const currentNumber = parts[parts.length - 1];
      if (currentNumber === "0") return;
      setExpression(expression + "0");
    } else if (val === "%") {
      if (expression === "") return;
      const match = expression.match(/.*[÷×−+]/);
      if (match) {
        const operatorIndex = match[0].length - 1;
        const operator = expression[operatorIndex];
        const left = expression.slice(0, operatorIndex);
        const right = expression.slice(operatorIndex + 1);
        if (!right) return;
        const leftVal = parseFloat(left);
        const rightVal = parseFloat(right);
        let percentExpr = "";
        if (operator === "+" || operator === "−") {
          percentExpr = String(leftVal * (rightVal / 100));
        } else if (operator === "×" || operator === "÷") {
          percentExpr = String(rightVal / 100);
        }
        const newExpr = expression.slice(0, operatorIndex + 1) + percentExpr;
        setExpression(newExpr);
      } else {
        const percentValue = String(parseFloat(expression) / 100);
        setExpression(percentValue);
      }
    } else {
      setExpression(expression + val);
    }
  };

  // 登録ボタン押下時の保存処理
  const handleConfirm = async () => {
    try {
      const amount = parseFloat(expression);
      const newId = await getNextId(STORAGE_KEYS.EXPENSES);
      if (isNaN(amount)) {
        Alert.alert("エラー", "正しい金額を入力してください");
        return;
      }
      const newExpense = {
        id: newId,
        amount,
        date: date,
        categoryId: categoryId,
        memo: memo,
      };
      const newExpenses = await addItemToStorage(
        STORAGE_KEYS.EXPENSES,
        expenses,
        newExpense
      );

      setExpenses(newExpenses);

      Alert.alert("保存完了", `${categoryId}に支出を保存しました`);
      console.log("保存データ:", newExpenses);

      setExpression("");
      setMemo("");
      setCalculating(false);
    } catch (error) {
      console.error("保存エラー:", error);
      Alert.alert("エラー", "保存に失敗しました");
    }
  };

  const handleCategoryEditOnSave = async (
    category: NewCategoryInput | Category
  ) => {
    // 編集 or 追加を判定して保存処理
    // category が Category 型なら編集、NewCategoryInput 型なら新規追加
    if (isCategory(category)) {
      // 編集
      try {
        const id = category.id;

        const newCategory = {
          id: id,
          name: category.name,
          icon: category.icon as keyof typeof Ionicons.glyphMap,
          order: category.order,
        };

        const updatedCategories = await editItemInStorage<Category>(
          STORAGE_KEYS.CATEGORIES,
          (item) => item.id === id,
          categories,
          newCategory as unknown as Category
        );

        setCategories(updatedCategories);
      } catch (e) {
        console.error("カテゴリ編集保存エラー:", e);
      }
      return;
    } else {
      // 新規追加
      const newId = await getNextId(STORAGE_KEYS.CATEGORIES);

      const newCategory = {
        id: newId,
        // 末尾に追加するので現在の件数＋1 を order にする
        order: String((categories?.length ?? 0) + 1),
        icon: category.icon as keyof typeof Ionicons.glyphMap,
        name: category.name,
      };

      const newCategories = await addItemToStorage(
        STORAGE_KEYS.CATEGORIES,
        categories,
        newCategory
      );

      setCategories(newCategories);
    }
  };

  // 親で削除を処理（ストレージと state を更新）
  const handleCategoryDelete = (id: string) => {
    Alert.alert(
      "確認",
      "このカテゴリを削除しますか？",
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              const updated = await removeItemFromStorage<Category>(
                STORAGE_KEYS.CATEGORIES,
                (item) => item.id === id
              );
              setCategories(updated);
            } catch (e) {
              console.error("カテゴリ削除エラー:", e);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // 並び替えを親で受けて保存
  const handleCategoryReorder = async (newList: Category[]) => {
    try {
      // 各要素に order を振り直す（1始まり）
      const updated = newList.map((cat, idx) => ({
        ...cat,
        order: String(idx + 1),
      }));
      await AsyncStorage.setItem(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify(updated)
      );
      setCategories(updated);
    } catch (e) {
      console.error("カテゴリ並び替え保存エラー:", e);
    }
  };

  const selectedCategory = getCategory(categories, categoryId);

  return (
    <SafeAreaLayout style={{ backgroundColor: c.background }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* 上部：金額表示＋日付選択＋カテゴリー選択 */}
          <View style={{ flex: 1.8, justifyContent: "flex-end" }}>
            <Text
              style={{
                color: c.text,
                fontSize: 40,
                textAlign: "right",
                marginBottom: 5,
              }}
            >
              {expression || "0"}
            </Text>

            {/* カテゴリー選択＋日付選択を横並びに */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              {/* カテゴリー選択 */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: c.secondary,
                    padding: 15,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={{ color: c.text, fontSize: 18 }}>{date}</Text>
                </TouchableOpacity>
              </View>

              {/* カテゴリー選択 */}
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  onPress={() => setShowCategoryModal(true)}
                  style={{
                    backgroundColor: c.secondary,
                    padding: 15,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {selectedCategory ? (
                    <Ionicons
                      name={selectedCategory.icon}
                      size={20}
                      color={c.text}
                      style={{ marginRight: 1 }}
                    />
                  ) : null}

                  <Text style={{ color: c.text, fontSize: 18 }}>
                    {selectedCategory
                      ? selectedCategory.name
                      : "カテゴリーを選択"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={c.text} />
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                marginBottom: 30,
              }}
            >
              <TextInput
                style={{
                  backgroundColor: c.secondary,
                  color: c.text,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 18,
                }}
                placeholder="メモを入力（例：昼食、タクシー代など）"
                placeholderTextColor={c.placeholder}
                value={memo}
                onChangeText={setMemo}
              />
            </View>
            <CalendarModal
              visible={showPicker}
              date={date}
              onClose={() => setShowPicker(false)}
              onChange={(selectedDate) => setDate(selectedDate)}
            />
          </View>

          {/* カテゴリーモーダル */}
          <CategoryModal
            visible={showCategoryModal}
            categories={categories}
            onClose={() => setShowCategoryModal(false)}
            onSelect={(categoryId) => setCategory(categoryId)}
            onEdit={() => {
              setShowCategoryModal(false);
              setShowCategoryListModal(true);
            }}
          />
          <CategoryListModal
            visible={showCategoryListModal}
            categories={categories}
            onClose={() => setShowCategoryListModal(false)}
            onDelete={handleCategoryDelete}
            onReorder={handleCategoryReorder}
            showCategoryEditModal={showCategoryEditModal}
            setShowCategoryEditModal={setShowCategoryEditModal}
            handleCategoryEditOnsave={handleCategoryEditOnSave}
          />

          {/* 下部：電卓ボタン */}
          <View style={{ flex: 3, justifyContent: "flex-end" }}>
            {buttons.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {row.map((btn) => {
                  const isLastEqualBtn = btn === "=";
                  const displayBtn =
                    isLastEqualBtn && !calculating ? displayConfirmBtn : btn;

                  return (
                    <TouchableOpacity
                      key={btn}
                      style={{
                        flex: 1,
                        margin: 5,
                        aspectRatio: 1,
                        borderRadius: 50,
                        backgroundColor:
                          displayBtn === displayConfirmBtn
                            ? c.operator
                            : ["÷", "×", "−", "+", "="].includes(btn)
                            ? c.accent
                            : c.secondary,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        // キーボードが開いている場合は閉じてから実行
                        if (keyboardVisible) {
                          Keyboard.dismiss();
                          setTimeout(() => {
                            if (displayBtn === displayConfirmBtn)
                              handleConfirm();
                            else handlePress(btn);
                          }, 50); // 150ms後に実行（UX的にちょうど良い）
                        } else {
                          if (displayBtn === displayConfirmBtn) handleConfirm();
                          else handlePress(btn);
                        }
                      }}
                    >
                      <Text style={{ color: c.text, fontSize: 24 }}>
                        {displayBtn}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaLayout>
  );
}
