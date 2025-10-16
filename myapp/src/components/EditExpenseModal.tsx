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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import CalendarModal from "../components/CalenderModal";
import { Expense } from "../types/models";
import { editItemInStorage } from "../util/storageUtils";
import { STORAGE_KEYS } from "../util/constant";

type Props = {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
  onSave: (updated: Expense) => void;
};

export default function EditExpenseModal({
  visible,
  expense,
  onClose,
  onSave,
}: Props) {
  const { theme } = useTheme();
  const c = colors[theme];
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 編集対象データが変わるたびに反映
  useEffect(() => {
    if (expense) {
      setAmount(String(expense.amount));
      setMemo(expense.memo ?? "");
      setDate(expense.date);
    }
  }, [expense]);

  const handleSave = async () => {
    // if (!amount || isNaN(Number(amount))) {
    //   Alert.alert("エラー", "正しい金額を入力してください");
    //   return;
    // }
    // if (!expense) return;
    // const updatedExpense: Expense = {
    //   ...expense,
    //   amount: parseFloat(amount),
    //   memo,
    //   date,
    // };
    // try {
    //   await editItemInStorage<Expense>(
    //     STORAGE_KEYS.EXPENSES,
    //     (item) => item.id === expense.id,
    //     [],
    //     updatedExpense
    //   );
    //   onSave(updatedExpense);
    //   onClose();
    // } catch (e) {
    //   console.error("編集保存エラー:", e);
    //   Alert.alert("エラー", "保存に失敗しました");
    // }
  };

  if (!expense) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            flex: 1,
            // backgroundColor: `${c.modalOverlay}AA`,
            justifyContent: "center",
            alignItems: "center",
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
                支出を編集
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
                  color: c.background,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                保存
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
