// screens/ExpenseScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SafeAreaLayout from "../components/SafeAreaLayout";
import CalendarModal from "../components/CalenderModal";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";

const buttons = [
  ["⌫", "AC", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

const displayConfirmBtn = "登録";

export default function ExpenseScreen() {
  const [expression, setExpression] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const { theme } = useTheme();
  const c = colors[theme];

  const handlePress = (val: string) => {
    // Error状態のときに数字や演算子を押したらリセット
    if (expression === "Error" && val !== "AC" && val !== "C") {
      if (/[0-9.]/.test(val)) {
        // 数字や小数点なら新規入力に切り替え
        setExpression(val === "." ? "0." : val);
        return;
      } else if (["÷", "×", "−", "+", "%", "±"].includes(val)) {
        // 演算子は無視
        return;
      }
    }

    // AC / C
    if (val === "AC" || val === "C") {
      setExpression("");
      if (val === "AC") setCalculating(false);
      return;
    }

    if (val === "⌫") {
      setExpression(expression.slice(0, -1));
    } else if (val === "=") {
      try {
        if (expression === "") return;

        let exp = expression;
        const lastChar = exp.slice(-1);

        if (["÷", "×", "−", "+"].includes(lastChar)) {
          // 最後が演算子なら削除して計算
          exp = exp.slice(0, -1);
        }

        if (exp === "") return; // 全部演算子だけだった場合は無視

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
      // 最後の数値部分だけ符号反転
      const parts = expression.split(/÷|×|−|\+/);
      const lastNumber = parts.pop();
      if (!lastNumber) return;

      const newLast = lastNumber.startsWith("-")
        ? lastNumber.slice(1)
        : "-" + lastNumber;
      const newExpr = parts.join("") + newLast;
      setExpression(newExpr);
    } else if (["÷", "×", "−", "+"].includes(val)) {
      if (expression === "") return; // 先頭の演算子は無効

      const lastChar = expression.slice(-1);
      if (["÷", "×", "−", "+"].includes(lastChar)) {
        // 演算子連続 → 上書き
        setExpression(expression.slice(0, -1) + val);
      } else {
        setExpression(expression + val);
      }
      setCalculating(true);
    } else if (val === ".") {
      const parts = expression.split(/÷|×|−|\+/);
      const currentNumber = parts[parts.length - 1];

      if (currentNumber.includes(".")) return; // 連続小数点防止
      if (currentNumber === "")
        setExpression(expression + "0."); // 空のとき 0. に
      else setExpression(expression + ".");
    } else if (val === "0") {
      const parts = expression.split(/÷|×|−|\+/);
      const currentNumber = parts[parts.length - 1];

      if (currentNumber === "0") return; // 先頭ゼロ連続防止
      setExpression(expression + "0");
    } else if (val === "%") {
      if (expression === "") return;

      // 最後の演算子を探す
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
        // 単独の数値の場合
        const percentValue = String(parseFloat(expression) / 100);
        setExpression(percentValue);
      }
    } else {
      // 数字やその他文字
      setExpression(expression + val);
    }
  };

  const handleConfirm = () => {
    // 確定押下時の処理（例: DB 登録など）
    console.log("金額確定:", expression, "日付:", date.toLocaleDateString());
    setCalculating(false);
    setExpression(""); // 必要に応じてリセット
  };

  return (
    <SafeAreaLayout style={{ backgroundColor: c.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* 上部：金額表示＋日付選択 */}
        <View style={{ flex: 2, justifyContent: "flex-end" }}>
          <Text
            style={{
              color: c.text,
              fontSize: 40,
              textAlign: "right",
              marginBottom: 20,
            }}
          >
            {expression || "0"}
          </Text>

          <View style={{ marginBottom: 50 }}>
            <TouchableOpacity
              style={{
                backgroundColor: c.secondary,
                padding: 15,
                borderRadius: 8,
              }}
              onPress={() => setShowPicker(true)}
            >
              <Text style={{ color: c.text, fontSize: 18 }}>
                {date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          <CalendarModal
            visible={showPicker}
            date={date}
            onClose={() => setShowPicker(false)}
            onChange={(selectedDate) => setDate(selectedDate)}
          />
        </View>

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
                          ? c.accent // 演算子ボタン
                          : c.secondary, // 数字ボタン
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      if (displayBtn === displayConfirmBtn) {
                        handleConfirm();
                      } else {
                        handlePress(displayBtn);
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
    </SafeAreaLayout>
  );
}
