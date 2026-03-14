import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { colors } from "../../theme/colors";
import { useTheme } from "../../contexts/ThemeContext";
import CalendarModal from "../CalenderModal";
import { getTodayLocal, getTomorrowLocal } from "../../util/dateUtils";
import { STORAGE_KEYS } from "../../util/constants";
import { addItemToStorage, getItemsFromStorage } from "../../util/storageUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavingsGoal } from "../../types/models";

const { width } = Dimensions.get("window");

type TargetSettingProps = {
  onValidityChange: (isValid: boolean) => void;
  edditFinish: boolean;
  setEdditFinish: React.Dispatch<React.SetStateAction<boolean>>;
  onComplete: () => void;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function TargetSetting({
  onValidityChange,
  edditFinish,
  setEdditFinish,
  onComplete,
  submitting,
  setSubmitting,
}: TargetSettingProps) {
  const { theme } = useTheme();
  const c = colors[theme];
  const tomorrowDate = getTomorrowLocal();

  const [targetAmount, setTargetAmount] = useState("");
  const [date, setDate] = useState(tomorrowDate);
  const [showPicker, setShowPicker] = useState(false);
  const [showError, setShowError] = useState(false);

  const isValid =
    !isNaN(Number(targetAmount)) &&
    targetAmount.trim() !== "" &&
    date.trim() !== "";

  const handleSave = async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (!targetAmount || !date) {
        resolve();
        return;
      }

      const savingGoal = {
        amount: targetAmount,
        deadline: date,
        createdAt: getTodayLocal(),
      };

      const storedSavingGoal = await getItemsFromStorage<SavingsGoal>(
        STORAGE_KEYS.SAVING_GOAL,
      );

      // 既に目標設定がある → 上書き確認
      if (storedSavingGoal.length > 0) {
        Alert.alert(
          "目標を上書きしますか？",
          "現在設定されている目標は削除され、新しい目標が保存されます。",
          [
            { text: "キャンセル", style: "cancel", onPress: () => resolve() },
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
                  resolve(); // ← 完了を通知
                } catch (e) {
                  console.error("保存処理エラー:", e);
                  reject(e);
                }
              },
            },
          ],
        );
        return;
      }

      // 目標がまだない → 普通に保存して resolve
      try {
        await addItemToStorage(STORAGE_KEYS.SAVING_GOAL, [], savingGoal);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };

  const validateFields = (isValid: boolean) => {
    onValidityChange(isValid);
    setShowError(!isValid);
    setSubmitting(false);
  };

  useEffect(() => {
    if (submitting) {
      validateFields(isValid);
      console.log("submitting");
      console.log(isValid);

      if (!isValid) return;

      // OK → onComplete()
      Alert.alert(
        "確認",
        `目標金額：${targetAmount}\n達成日：${date}\nこの内容で設定しますか？`,
        [
          {
            text: "キャンセル",
            style: "cancel",
            onPress: () => setSubmitting(false),
          },
          {
            text: "OK",
            onPress: async () => {
              await handleSave();
              onComplete();
            },
          },
        ],
      );
    }
  }, [submitting]);

  return (
    <View style={[styles.page, { backgroundColor: c.card }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ width: "100%", alignItems: "center" }}>
          <Text style={[styles.title, { color: c.text }]}>
            まずは目標を設定しよう
          </Text>

          <Text style={[styles.description, { color: c.text }]}>
            目標金額と期限を入力してください。{"\n"}
            あなたが毎日自由に使える金額が{"\n"}
            わかるようになる第一歩です。{"\n"}
            後から設定を変更することも可能です。
          </Text>

          {/* 目標金額 */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: c.text }]}>目標金額</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: c.background,
                  color: c.text,
                  borderColor:
                    showError && targetAmount.trim() === "" ? "red" : c.border,
                },
              ]}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="例: 300,000"
              placeholderTextColor={c.text + "66"}
              keyboardType="numeric"
            />
            {/* ★ エラーメッセージ */}
            {showError && targetAmount.trim() === "" && (
              <Text style={[styles.errorText]}>目標金額を入力してください</Text>
            )}
            {showError &&
              targetAmount.trim() !== "" &&
              isNaN(Number(targetAmount)) && (
                <Text style={[styles.errorText]}>
                  目標金額は数字で入力してください
                </Text>
              )}
          </View>

          {/* 達成日 */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: c.text }]}>達成日</Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={[
                styles.dateButton,
                {
                  backgroundColor: c.background,
                  borderColor:
                    showError && date.trim() === "" ? "red" : c.border,
                },
              ]}
            >
              <Text style={[styles.dateButtonText, { color: c.text }]}>
                {date}
              </Text>
            </TouchableOpacity>

            {/* ★ エラーメッセージ */}
            {showError && date.trim() === "" && (
              <Text style={[styles.errorText]}>達成日を選択してください</Text>
            )}
          </View>

          <CalendarModal
            minDate={tomorrowDate}
            visible={showPicker}
            date={date}
            onClose={() => setShowPicker(false)}
            onChange={(selectedDate) => {
              setDate(selectedDate);
              setShowPicker(false);
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 320,
    marginBottom: 32,
  },
  inputWrapper: {
    width: "100%",
    maxWidth: 340,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  dateButton: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateButtonText: {
    fontSize: 18,
  },
  errorText: {
    marginTop: 6,
    fontSize: 14,
    color: "red",
  },
});
