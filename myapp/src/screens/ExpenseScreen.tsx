// screens/ExpenseScreen.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SafeAreaLayout from "../components/SafeAreaLayout";
import CalendarModal from "../components/CalenderModal";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";

const buttons = [
  ["AC", "⌫", "%", "÷"],
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
    if (val === "AC") {
      setExpression("");
      setCalculating(false);
    } else if (val === "⌫") setExpression(expression.slice(0, -1));
    else if (val === "=") {
      try {
        if (/÷0/.test(expression)) {
          throw new Error("0で割ることはできません");
        }
        const replaced = expression
          .replace(/÷/g, "/")
          .replace(/×/g, "*")
          .replace(/−/g, "-");

        const result = eval(replaced);
        // 無限大になった場合もエラー扱い
        if (!isFinite(result)) throw new Error("無効な計算");

        setExpression(String(eval(replaced)));

        setCalculating(false);
      } catch {
        setExpression("Error");
      }
    } else if (val === "±")
      setExpression(
        expression.startsWith("-") ? expression.slice(1) : "-" + expression
      );
    else if (val === "÷" || val === "×" || val === "−" || val === "+") {
      setExpression(expression + val);
      setCalculating(true);
    } else setExpression(expression + val);
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
