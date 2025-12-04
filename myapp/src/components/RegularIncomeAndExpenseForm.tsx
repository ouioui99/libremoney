import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import { Category, CycleRule } from "../types/models";
import CycleRuleSettingModal from "./CycleRuleSettingModal";

type Props = {
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<Category | undefined>
  >;
  selectedCategory?: Category;
  categories: Category[];
  onAdd: (
    amount: number,
    memo: string,
    categoryId: string,

    cycleRule: CycleRule["type"]
  ) => void;
  onPressCategorySelect: () => void;
  type: "expense" | "income";
};

const RegularIncomeAndExpenseForm: React.FC<Props> = ({
  selectedCategory,
  setSelectedCategory,
  categories,
  onAdd,
  onPressCategorySelect,
  type,
}) => {
  const { theme } = useTheme();
  const c = colors[theme];
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const [cycleRuleType, setCycleRuleType] = useState<CycleRule["type"]>();
  const [showCycleRuleSettingModal, setShowCycleRuleSettingModal] =
    useState(false);

  const handleSubmit = () => {
    if (!amount) return Alert.alert("入力エラー", "金額を入力してください。");
    if (!cycleRuleType)
      return Alert.alert("入力エラー", "サイクルルールを設定してください");
    if (!selectedCategory)
      return Alert.alert("入力エラー", "カテゴリーを設定してください");
    onAdd(Number(amount), memo, selectedCategory.id, cycleRuleType);
    setAmount("");
    setMemo("");
    setSelectedCategory(undefined);
    setCycleRuleType(undefined);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={{ justifyContent: "center", alignItems: "center", marginTop: 8 }}
      >
        <View style={{ width: "95%", maxWidth: 400 }}>
          <View style={[styles.card, { backgroundColor: c.card }]}>
            {/* 金額 */}
            <Text style={[styles.label, { color: c.text }]}>金額</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="例: 250000"
              keyboardType="numeric"
              placeholderTextColor={c.placeholder}
              style={[
                styles.input,
                {
                  backgroundColor: c.background,
                  color: c.text,
                  borderColor: c.border,
                },
              ]}
            />

            {/* メモ */}
            <Text style={[styles.label, { color: c.text, marginTop: 12 }]}>
              メモ
            </Text>
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder={type === "income" ? "例: 基本給" : "例: 家賃"}
              placeholderTextColor={c.placeholder}
              style={[
                styles.input,
                {
                  backgroundColor: c.background,
                  color: c.text,
                  borderColor: c.border,
                },
              ]}
            />

            {/* カテゴリー選択 */}
            <Text style={[styles.label, { color: c.text, marginTop: 12 }]}>
              カテゴリー
            </Text>
            <TouchableOpacity
              onPress={onPressCategorySelect}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: c.background,
                  borderColor: c.border,
                },
              ]}
            >
              <Text style={{ color: c.text }}>
                {selectedCategory ? selectedCategory.name : "カテゴリーを選択"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={c.text} />
            </TouchableOpacity>

            {/* サイクルルール */}
            <TouchableOpacity
              style={[styles.cycleButton, { backgroundColor: c.accent }]}
              onPress={() => setShowCycleRuleSettingModal(true)}
            >
              <Ionicons name="repeat-outline" size={18} color={c.text} />
              <Text style={{ color: c.text, marginLeft: 6 }}>
                {typeof cycleRuleType === "undefined"
                  ? "サイクルルールを設定"
                  : cycleRuleType === "weekly"
                  ? "週1（毎週）"
                  : cycleRuleType === "monthly"
                  ? "月1（毎月）"
                  : "年1（毎年）"}
              </Text>
            </TouchableOpacity>

            {/* 追加ボタン */}
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor:
                    amount && cycleRuleType ? c.accent : c.disabledOnCard,
                },
              ]}
              disabled={!amount || !cycleRuleType}
              onPress={handleSubmit}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* サイクルルール設定モーダル */}
        <CycleRuleSettingModal
          visible={showCycleRuleSettingModal}
          onClose={() => setShowCycleRuleSettingModal(false)}
          onSave={(rule) => {
            setCycleRuleType(rule);
            setShowCycleRuleSettingModal(false);
          }}
          initialCycle={cycleRuleType}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RegularIncomeAndExpenseForm;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  label: { fontSize: 15, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Platform.OS === "ios" ? 10 : 8,
    fontSize: 16,
    marginTop: 4,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cycleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
});
