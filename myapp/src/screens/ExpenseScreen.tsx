import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import SafeAreaLayout from "../components/SafeAreaLayout";
import CalendarModal from "../components/CalenderModal";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  addItemToStorage,
  getItemsFromStorage,
  getNextId,
} from "../util/storageUtils";
import { CALC_BUTTONS, STORAGE_KEYS } from "../util/constants";
import { Category, Expense, NewCategoryInput } from "../types/models";
import { getCategory } from "../util/displayUtils";
import CategorySelector from "../components/CategorySelector";
import {
  handleCategoryDelete,
  handleCategoryEditOnSave,
  handleCategoryReorder,
} from "../util/categoryUtils";

const displayConfirmBtn = "登録";

export default function ExpenseScreen() {
  const [expression, setExpression] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);
  const [memo, setMemo] = useState("");
  const [isIncomeMode, setIsIncomeMode] = useState(false);

  const { theme } = useTheme();
  const c = colors[theme];

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // ▼ フェード・色アニメーション設定
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current; // 0 = expense, 1 = income

  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      // 初回レンダー時はアニメーションをスキップ
      colorAnim.setValue(isIncomeMode ? 1 : 0);
      firstRender.current = false;
      return;
    }

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: isIncomeMode ? 1 : 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [isIncomeMode]);

  const titleColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [c.expense, c.income],
  });

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

        const storedExpenseCategories = await getItemsFromStorage<Category>(
          STORAGE_KEYS.EXPENSE_CATEGORIES
        );

        const storeIncomeCategories = await getItemsFromStorage<Category>(
          STORAGE_KEYS.INCOME_CATEGORIES
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
        setExpenseCategories(sortedExpenseCategories);
        setIncomeCategories(sortedIncomeCategories);
      } catch (e) {
        console.error("支出データ読み込みエラー:", e);
      }
    })();
  }, [isIncomeMode, showCategoryModal]);

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
      const storageKey = isIncomeMode
        ? STORAGE_KEYS.INCOMES
        : STORAGE_KEYS.EXPENSES; // 👈 切替

      const newId = await getNextId(storageKey);
      if (isNaN(amount)) {
        Alert.alert("エラー", "正しい金額を入力してください");
        return;
      }

      const newItem = {
        id: newId,
        amount,
        date,
        categoryId,
        memo,
      };
      const newItems = await addItemToStorage(storageKey, expenses, newItem);

      setExpenses(newItems);

      Alert.alert(
        "保存完了",
        `${isIncomeMode ? "収入" : "支出"}を保存しました`
      );

      setExpression("");
      setMemo("");
      setCalculating(false);
    } catch (error) {
      console.error("保存エラー:", error);
      Alert.alert("エラー", "保存に失敗しました");
    }
  };

  const selectedCategory = getCategory(
    isIncomeMode ? incomeCategories : expenseCategories,
    categoryId
  );

  return (
    <SafeAreaLayout style={{ backgroundColor: c.background }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* ▼ 支出・収入 切り替えトグル */}
          <View style={{ alignItems: "center", marginBottom: 10 }}>
            <Animated.Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                opacity: fadeAnim,
                color: titleColor,
              }}
            >
              {isIncomeMode ? "収入を登録" : "支出を登録"}
            </Animated.Text>
          </View>
          {/* 上部：金額表示＋日付選択＋カテゴリー選択 */}
          <View style={{ flex: 1.5, justifyContent: "flex-end" }}>
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
              {/* 日付選択 */}
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

          {/* 下部：電卓ボタン */}
          <View style={{ flex: 3, justifyContent: "flex-end" }}>
            {CALC_BUTTONS.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {row.map((btn) => {
                  // 👇 ±ボタンを収入／支出トグルに置き換え
                  if (btn === "±") {
                    return (
                      <TouchableOpacity
                        key="incomeToggle"
                        onPress={() => setIsIncomeMode((prev) => !prev)}
                        activeOpacity={0.8}
                        style={{
                          flex: 1,
                          margin: 5,
                          aspectRatio: 1,
                          borderRadius: 12, // 角丸四角
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: isIncomeMode ? c.income : c.expense, // 状態で色変更
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 3,
                          elevation: 2,
                        }}
                      >
                        <Text
                          style={{
                            color: c.textOnAccent || "#fff",
                            fontWeight: "bold",
                            fontSize: 16,
                          }}
                        >
                          {isIncomeMode ? "収入" : "支出"}
                        </Text>
                      </TouchableOpacity>
                    );
                  }

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
                        if (keyboardVisible) {
                          Keyboard.dismiss();
                          setTimeout(() => {
                            if (displayBtn === displayConfirmBtn)
                              handleConfirm();
                            else handlePress(btn);
                          }, 50);
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
