// components/onboarding/PageRecipe.tsx
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
} from "react-native";
import { colors } from "../../theme/colors";
import { useTheme } from "../../contexts/ThemeContext";
import CalendarModal from "../CalenderModal";
import { getTodayLocal } from "../../util/dateUtils";

const { width } = Dimensions.get("window");

type PageRecipeProps = {
  onValidityChange: (isValid: boolean) => void;
};

export default function PageRecipe({ onValidityChange }: PageRecipeProps) {
  const { theme } = useTheme();
  const c = colors[theme];

  const [targetAmount, setTargetAmount] = useState("");
  const [date, setDate] = useState(getTodayLocal());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const isValid = targetAmount.trim() !== "" && date.trim() !== "";
    onValidityChange(isValid);
  }, [targetAmount, date]);

  return (
    <View style={[styles.page, { backgroundColor: c.card }]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ width: "100%", alignItems: "center" }}>
          <Text style={[styles.title, { color: c.text }]}>
            まずは目標を設定しましょう
          </Text>

          <Text style={[styles.description, { color: c.text }]}>
            目標金額と期限を入力してください。{"\n"}
            あなたが毎日自由に使える金額が{"\n"}
            わかるようになる第一歩です。
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
                  borderColor: c.border,
                },
              ]}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="例: 300,000"
              placeholderTextColor={c.text + "66"}
              keyboardType="numeric"
            />
          </View>

          {/* 達成日 */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: c.text }]}>達成日</Text>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={[
                styles.dateButton,
                { backgroundColor: c.background, borderColor: c.border },
              ]}
            >
              <Text style={[styles.dateButtonText, { color: c.text }]}>
                {date}
              </Text>
            </TouchableOpacity>
          </View>

          <CalendarModal
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
});
