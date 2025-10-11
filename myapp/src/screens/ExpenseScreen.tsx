import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SafeAreaLayout from "../components/SafeAreaLayout";
import CalendarModal from "../components/CalenderModal";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import CategoryModal from "../components/CategoryModal";
import CategoryEditModal from "../components/CategoryEditModal";

const buttons = [
  ["⌫", "AC", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

const categories: {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "1", name: "食費", icon: "fast-food-outline" },
  { id: "2", name: "交通", icon: "bus-outline" },
  { id: "3", name: "日用品", icon: "cart-outline" },
  { id: "4", name: "光熱費", icon: "flash-outline" },
  { id: "5", name: "娯楽", icon: "game-controller-outline" },
  { id: "6", name: "その他", icon: "ellipsis-horizontal-outline" },
];

const displayConfirmBtn = "登録";

export default function ExpenseScreen() {
  const [expression, setExpression] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [expenses, setExpenses] = useState<
    { amount: number; date: string; category: string }[]
  >([]);
  const [category, setCategory] = useState<string>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);

  const { theme } = useTheme();
  const c = colors[theme];

  // 起動時に過去の支出を読み込み
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("expenses");
        if (stored) setExpenses(JSON.parse(stored));
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
      if (isNaN(amount)) {
        Alert.alert("エラー", "正しい金額を入力してください");
        return;
      }

      const newExpense = {
        amount,
        date: date.toISOString(),
        category: category,
      };

      const newExpenses = [...expenses, newExpense];
      setExpenses(newExpenses);
      await AsyncStorage.setItem("expenses", JSON.stringify(newExpenses));

      Alert.alert("保存完了", `${category}に支出を保存しました`);
      console.log("保存データ:", newExpenses);

      setExpression("");
      setCalculating(false);
    } catch (error) {
      console.error("保存エラー:", error);
      Alert.alert("エラー", "保存に失敗しました");
    }
  };

  return (
    <SafeAreaLayout style={{ backgroundColor: c.background }}>
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
              marginBottom: 30,
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
                <Text style={{ color: c.text, fontSize: 18 }}>
                  {date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 日付選択 */}
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
                <Text style={{ color: c.text, fontSize: 18 }}>
                  {category || "カテゴリーを選択"}
                </Text>
                <Ionicons name="chevron-down" size={22} color={c.text} />
              </TouchableOpacity>
            </View>
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
          onSelect={(name) => setCategory(name)}
          onEdit={() => {
            setShowCategoryEditModal(true);
            setShowCategoryModal(false);
          }}
        />
        <CategoryEditModal
          visible={showCategoryEditModal}
          onClose={() => setShowCategoryEditModal(false)}
        />

        {/* 下部：電卓ボタン */}
        <View style={{ flex: 3, justifyContent: "flex-end" }}>
          {buttons.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{ flexDirection: "row", justifyContent: "space-between" }}
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
                      if (displayBtn === displayConfirmBtn) handleConfirm();
                      else handlePress(displayBtn);
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
    </SafeAreaLayout>
  );
}
