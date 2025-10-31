import React, { useEffect, useState } from "react";
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
import { STORAGE_KEYS } from "../util/constant";
import { addItemToStorage, getItemsFromStorage } from "../util/storageUtils";
import { SavingsGoal } from "../types/models";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SavingsGoalScreen({ navigation }: any) {
  const { theme } = useTheme();
  const c = colors[theme];
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const today = new Date(getTodayLocal());

  useEffect(() => {
    (async () => {
      try {
        const storedSavingGoal = await getItemsFromStorage<SavingsGoal>(
          STORAGE_KEYS.SAVING_GOAL
        );

        if (storedSavingGoal.length > 0) {
          setAmount(String(storedSavingGoal[0].amount));
          setDeadline(new Date(storedSavingGoal[0].deadline));
          setIsEdit(true);
        }
      } catch (e) {
        console.error("目標データ読み込みエラー:", e);
      }
    })();
  }, []);

  const handleConfirm = (date: Date) => {
    setDeadline(date);
    setDatePickerVisible(false);
  };

  const handleSave = () => {
    if (!amount || !deadline) return;

    // ✅ 編集モードの場合は確認を挟む
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
                // 一度目標を削除
                await AsyncStorage.setItem(
                  STORAGE_KEYS.SAVING_GOAL,
                  JSON.stringify([])
                );
                // 新しい目標を保存
                await addItemToStorage(
                  STORAGE_KEYS.SAVING_GOAL,
                  [],
                  savingGoal
                );
                navigation.goBack();
              } catch (e) {
                console.error("保存処理エラー:", e);
              }
            },
          },
        ]
      );
      return; // ⚠️ Alertが出た時点で一旦終了
    }

    const savingGoal = {
      amount,
      deadline: deadline.toISOString().split("T")[0],
    };

    //編集の場合は現状1つしか目標を設定できない想定なので一度目標を消す
    if (isEdit) {
      AsyncStorage.setItem(STORAGE_KEYS.SAVING_GOAL, JSON.stringify([]));
    }
    addItemToStorage(STORAGE_KEYS.SAVING_GOAL, [], savingGoal);

    navigation.goBack();
  };

  return (
    <SafeAreaLayout
      style={[styles.container, { backgroundColor: c.background }]}
    >
      {/* ✅ カスタムヘッダー */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: c.background,
            borderBottomColor: c.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>
          貯金目標を設定
        </Text>
        {/* バランス用スペーサー */}
        <View style={{ width: 70 }} />
      </View>

      {/* --- 本文 --- */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingTop: -56 / 2, // 👈 ヘッダー分のズレ補正
          }}
        >
          {/* 本文コンテンツ全体を幅制限して中央に */}
          <View style={{ width: "90%", maxWidth: 400 }}>
            {/* 説明文 */}
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
                  backgroundColor: amount && deadline ? c.accent : c.border,
                  shadowColor: c.accent,
                },
              ]}
              disabled={!amount || !deadline}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>保存する</Text>
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
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  backText: {
    color: "#007AFF",
    fontSize: 17,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
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
});
