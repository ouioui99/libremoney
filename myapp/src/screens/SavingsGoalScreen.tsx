import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";
import { Ionicons } from "@expo/vector-icons";
import { getTodayLocal } from "../util/dateUtils";
import { DISPLAY_TITLE, STORAGE_KEYS } from "../util/constants";
import { addItemToStorage, getItemsFromStorage } from "../util/storageUtils";
import { SavingsGoal } from "../types/models";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustumHeader from "../components/CustomHeader";

export default function SavingsGoalScreen({ navigation }: any) {
  const { theme } = useTheme();
  const c = colors[theme];

  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [originalGoal, setOriginalGoal] = useState<SavingsGoal | null>(null);
  const [hasChanged, setHasChanged] = useState(false);
  const [showError, setShowError] = useState(false);

  const today = new Date(getTodayLocal());

  const isValid =
    !isNaN(Number(amount)) &&
    amount.trim() !== "" &&
    deadline !== null &&
    1 < Number(amount);

  // 🔹 初回読み込み（既存データがある場合は編集モードに）
  useEffect(() => {
    (async () => {
      try {
        const storedSavingGoal = await getItemsFromStorage<SavingsGoal>(
          STORAGE_KEYS.SAVING_GOAL,
        );

        if (storedSavingGoal.length > 0) {
          const goal = storedSavingGoal[0];
          setAmount(String(goal.amount));
          setDeadline(new Date(goal.deadline));
          setOriginalGoal(goal);
          if (new Date(goal.deadline) < today) {
            setIsEdit(true);
          }
        }
      } catch (e) {
        console.error("目標データ読み込みエラー:", e);
      }
    })();
  }, []);

  // 🔹 値の変更検知
  useEffect(() => {
    if (!isEdit || !originalGoal) {
      setHasChanged(!!amount && !!deadline);
      return;
    }

    setShowError(!isValid);

    const originalAmount = String(originalGoal.amount);
    const originalDeadline = new Date(originalGoal.deadline)
      .toISOString()
      .split("T")[0];
    const currentDeadline = deadline
      ? deadline.toISOString().split("T")[0]
      : "";

    setHasChanged(
      amount !== originalAmount || currentDeadline !== originalDeadline,
    );
  }, [amount, deadline, isEdit, originalGoal]);

  // 🔹 日付選択
  const handleConfirm = (date: Date) => {
    setDeadline(date);
    setDatePickerVisible(false);
  };

  // 🔹 保存処理
  const handleSave = () => {
    if (!isValid) return;

    const savingGoal = {
      amount,
      deadline: deadline.toISOString().split("T")[0],
      createdAt: getTodayLocal(),
    };

    if (isEdit) {
      Alert.alert(
        "目標を上書きしますか？",
        "現在設定されている目標は削除され、新しい目標が保存されます。",
        [
          { text: "キャンセル", style: "cancel" },
          {
            text: "上書きする",
            style: "destructive",
            onPress: async () => {
              try {
                await AsyncStorage.setItem(
                  STORAGE_KEYS.SAVING_GOAL,
                  JSON.stringify([]),
                );
                await addItemToStorage(
                  STORAGE_KEYS.SAVING_GOAL,
                  [],
                  savingGoal,
                );
                navigation.goBack();
              } catch (e) {
                console.error("保存処理エラー:", e);
              }
            },
          },
        ],
      );
      return;
    }

    addItemToStorage(STORAGE_KEYS.SAVING_GOAL, [], savingGoal);
    navigation.goBack();
  };

  // 🔹 日付ピッカーの初期値（編集モードなら既存期限、なければ今日）
  const initialDate = useMemo(() => {
    return deadline ? deadline : today;
  }, [deadline]);

  return (
    <SafeAreaLayout
      style={[styles.container, { backgroundColor: c.background }]}
    >
      {/* ヘッダー */}
      <CustumHeader
        title={DISPLAY_TITLE.savingsGoalScreen}
        navigation={navigation}
      />

      {/* --- 本文 --- */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingTop: -56 / 2, // 👈 ヘッダー分のズレ補正
          }}
        >
          <View style={{ width: "90%", maxWidth: 400 }}>
            <Text
              style={[
                styles.subtitle,
                {
                  color: c.placeholder,
                  marginTop: 16,
                  textAlign: "center",
                  fontSize: 15,
                },
              ]}
            >
              いつまでに、いくら貯めるかを設定しましょう
            </Text>

            {/* 入力カード */}
            <View
              style={[
                styles.goalCard,
                {
                  backgroundColor: c.card,
                  shadowColor: theme === "dark" ? "#000" : "#ccc",
                },
              ]}
            >
              {/* 金額入力 */}
              <Text style={[styles.label, { color: c.text }]}>目標金額</Text>
              <View style={styles.amountRow}>
                <Ionicons name="cash-outline" size={22} color={c.accent} />
                <TextInput
                  style={[styles.amountInput, { color: c.text }]}
                  placeholder="例: 500000"
                  placeholderTextColor={c.placeholder}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />

                <Text style={[styles.unit, { color: c.placeholder }]}>円</Text>
              </View>
              {/* ★ エラーメッセージ */}
              {showError && amount.trim() === "" && (
                <Text style={[styles.errorText]}>
                  目標金額を入力してください
                </Text>
              )}
              {showError && amount.trim() !== "" && isNaN(Number(amount)) && (
                <Text style={[styles.errorText]}>
                  目標金額は数字で入力してください
                </Text>
              )}
              {showError && amount.trim() !== "" && Number(amount) < 1 && (
                <Text style={[styles.errorText]}>
                  目標金額は1以上の数字で入力してください
                </Text>
              )}

              {/* 期限 */}
              <Text style={[styles.label, { color: c.text, marginTop: 20 }]}>
                期限
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  {
                    borderColor: c.border,
                    backgroundColor: c.secondary,
                  },
                ]}
                onPress={() => setDatePickerVisible(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={deadline ? c.accent : c.placeholder}
                />
                <Text
                  style={{
                    marginLeft: 8,
                    fontSize: 16,
                    color: deadline ? c.text : c.placeholder,
                  }}
                >
                  {deadline
                    ? deadline.toISOString().split("T")[0]
                    : "期限を選択"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 保存ボタン */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor:
                    hasChanged && amount && deadline ? c.accent : c.border,
                  shadowColor: c.accent,
                },
              ]}
              disabled={!hasChanged || !amount || !deadline}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {isEdit ? "上書き保存" : "保存する"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* 日付ピッカー */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={() => setDatePickerVisible(false)}
        locale="ja"
        confirmTextIOS="決定"
        cancelTextIOS="キャンセル"
        minimumDate={today}
        date={initialDate}
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  subtitle: {
    fontSize: 15,
    marginBottom: 20,
  },
  goalCard: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 8,
  },
  amountInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 22,
    fontWeight: "700",
    paddingVertical: Platform.OS === "ios" ? 6 : 0,
  },
  unit: {
    fontSize: 16,
    marginLeft: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  saveButton: {
    alignSelf: "stretch",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 6,
    fontSize: 14,
    marginLeft: 30,
    color: "red",
  },
});
