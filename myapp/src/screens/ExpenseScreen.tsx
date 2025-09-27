import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import SafeAreaLayout from "../components/SafeAreaLayout";
import CalendarModal from "../components/CalenderModal";

const buttons = [
  ["AC", "⌫", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

export default function ExpenseScreen() {
  const [expression, setExpression] = useState(""); // 計算式
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = (val: string) => {
    if (val === "AC") {
      setExpression("");
    } else if (val === "⌫") {
      setExpression(expression.slice(0, -1));
    } else if (val === "=") {
      try {
        // 演算子を JS 用に置換
        const replaced = expression
          .replace(/÷/g, "/")
          .replace(/×/g, "*")
          .replace(/−/g, "-");
        const result = eval(replaced); // 簡易計算
        setExpression(String(result));
      } catch {
        setExpression("Error");
      }
    } else if (val === "±") {
      if (expression.startsWith("-")) {
        setExpression(expression.slice(1));
      } else {
        setExpression("-" + expression);
      }
    } else {
      setExpression(expression + val);
    }
  };

  const handelOnChange = (_event: any, selectedDate?: Date) => {
    setShowPicker(false); // カレンダー閉じる
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaLayout>
      <View style={{ flex: 1, padding: 20, backgroundColor: "black" }}>
        {/* 金額表示 */}
        <Text
          style={{
            color: "white",
            fontSize: 40,
            textAlign: "right",
            marginBottom: 20,
          }}
        >
          {expression || "0"}
        </Text>

        {/* 日付選択 */}
        <TouchableOpacity
          style={{
            backgroundColor: "#333",
            padding: 15,
            borderRadius: 8,
            marginBottom: 20,
          }}
          onPress={() => setShowPicker(true)}
        >
          <Text style={{ color: "white", fontSize: 18 }}>
            {date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <CalendarModal
          visible={showPicker}
          date={date}
          onClose={() => setShowPicker(false)}
          onChange={(selectedDate) => setDate(selectedDate)}
        />

        {/* 電卓ボタン */}
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          {buttons.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {row.map((btn) => (
                <TouchableOpacity
                  key={btn}
                  style={{
                    flex: 1,
                    margin: 5,
                    aspectRatio: 1,
                    borderRadius: 50,
                    backgroundColor: ["÷", "×", "−", "+", "="].includes(btn)
                      ? "orange"
                      : "#444",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => handlePress(btn)}
                >
                  <Text style={{ color: "white", fontSize: 24 }}>{btn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaLayout>
  );
}
