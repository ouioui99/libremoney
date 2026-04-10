import React, { useState, useEffect } from "react";
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
import { Category, CycleRule, RegularIncome } from "../types/models";
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
    cycleRule: CycleRule["type"],
  ) => void;
  // 編集用のハンドラーを追加
  onUpdate?: (
    id: string,
    amount: number,
    memo: string,
    categoryId: string,
    cycleRule: CycleRule["type"],
  ) => void;
  onDelete?: (id: string) => void;
  onPressCategorySelect: () => void;
  type: "expense" | "income";
  itemToEdit?: RegularIncome;
};

const RegularIncomeAndExpenseForm: React.FC<Props> = ({
  selectedCategory,
  setSelectedCategory,
  categories,
  onAdd,
  onUpdate,
  onDelete,
  onPressCategorySelect,
  type,
  itemToEdit,
}) => {
  const { theme } = useTheme();
  const c = colors[theme];

  // State定義
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [cycleRuleType, setCycleRuleType] = useState<CycleRule["type"]>();
  const [showCycleRuleSettingModal, setShowCycleRuleSettingModal] =
    useState(false);

  const [errors, setErrors] = useState<{
    amount?: string;
    category?: string;
    cycle?: string;
  }>({});

  // 編集モード判定
  const isEditMode = !!itemToEdit;

  // itemToEdit が渡された時、または変更された時にフォームを埋める
  useEffect(() => {
    if (itemToEdit) {
      setAmount(itemToEdit.amount.toString());
      setMemo(itemToEdit.memo || "");
      setCycleRuleType(itemToEdit.cycleRule.type);

      // カテゴリーオブジェクトを親コンポーネントのStateにセット
      const currentCategory = categories.find(
        (cat) => cat.id === itemToEdit.categoryId,
      );
      if (currentCategory) {
        setSelectedCategory(currentCategory);
      }
    } else {
      // 新規作成時はクリア
      setAmount("");
      setMemo("");
      setCycleRuleType(undefined);
      setSelectedCategory(undefined);
    }
  }, [itemToEdit, categories, setSelectedCategory]);

  useEffect(() => {
    setErrors((prev) => ({ ...prev, category: undefined }));
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      const currentCategory = categories.find(
        (cat) => cat.id === selectedCategory.id,
      );
      if (currentCategory) {
        setSelectedCategory(currentCategory);
      }

      // フォーム内で表示に使うStateがあればここで更新（現在はPropsを直接見ているなら不要）
    }
  }, [selectedCategory]);

  const handleSubmit = () => {
    const newErrors: typeof errors = {};

    if (!amount) {
      newErrors.amount = "金額を入力してください";
    } else if (isNaN(Number(amount))) {
      newErrors.amount = "数字を入力してください";
    }

    if (!cycleRuleType) {
      newErrors.cycle = "サイクルを設定してください";
    }

    if (!selectedCategory) {
      newErrors.category = "カテゴリーを選択してください";
    }
    setErrors(newErrors);

    if (
      !selectedCategory ||
      !cycleRuleType ||
      Object.keys(newErrors).length > 0
    )
      return;

    if (isEditMode && itemToEdit && onUpdate) {
      // 更新処理
      onUpdate(
        itemToEdit.id,
        Number(amount),
        memo,
        selectedCategory.id,
        cycleRuleType,
      );
    } else {
      // 新規追加処理
      onAdd(Number(amount), memo, selectedCategory.id, cycleRuleType);
    }

    // フォームのリセット（編集時は親側で閉じることが多いため、適宜調整）
    if (!isEditMode) {
      setAmount("");
      setMemo("");
      setSelectedCategory(undefined);
      setCycleRuleType(undefined);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.formContainer}>
        <View style={{ width: "100%", maxWidth: 400 }}>
          <View style={[styles.card, { backgroundColor: c.card }]}>
            {/* タイトル（任意） */}
            {/* <Text style={[styles.title, { color: c.text }]}>
              {isEditMode ? "定期収入を編集" : "定期収入を追加"}
            </Text> */}

            {/* 金額 */}
            <Text style={[styles.label, { color: c.text }]}>金額</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="例: 50000"
              placeholderTextColor={c.placeholder}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              style={[
                styles.input,
                {
                  backgroundColor: c.background,
                  color: c.text,
                  borderColor: errors.amount ? c.error : c.border,
                },
              ]}
            />
            {errors.amount && (
              <Text style={{ color: c.error, fontSize: 12, marginTop: 4 }}>
                {errors.amount}
              </Text>
            )}

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
              onPress={() => {
                onPressCategorySelect();
              }}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: c.background,
                  borderColor: errors.category ? c.error : c.border,
                },
              ]}
            >
              <Text style={{ color: c.text }}>
                {selectedCategory ? selectedCategory.name : "カテゴリーを選択"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={c.text} />
            </TouchableOpacity>

            {errors.category && (
              <Text style={{ color: c.error, fontSize: 12, marginTop: 4 }}>
                {errors.category}
              </Text>
            )}

            {/* サイクルルール */}
            <Text style={[styles.label, { color: c.text, marginTop: 12 }]}>
              サイクル
            </Text>
            <TouchableOpacity
              style={[
                styles.cycleButton,
                {
                  borderColor: errors.cycle ? c.error : c.accent,
                  backgroundColor: c.accent,
                },
              ]}
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
            {errors.cycle && (
              <Text style={{ color: c.error, fontSize: 12, marginTop: 4 }}>
                {errors.cycle}
              </Text>
            )}

            {/* 送信ボタン（テキストとアイコンを動的に変更） */}
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: c.operator,
                  //amount && cycleRuleType ? c.operator : c.disabledOnCard,
                },
              ]}
              //disabled={!amount || !cycleRuleType}
              onPress={handleSubmit}
            >
              <Ionicons
                name={isEditMode ? "checkmark" : "add"}
                size={20}
                color="#fff"
              />
              <Text style={styles.addButtonText}>
                {isEditMode ? "更新する" : "追加する"}
              </Text>
            </TouchableOpacity>

            {isEditMode && itemToEdit && onDelete && (
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: c.danger }]}
                onPress={() => {
                  Alert.alert("削除確認", "この定期項目を削除しますか？", [
                    { text: "キャンセル", style: "cancel" },
                    {
                      text: "削除",
                      style: "destructive",
                      onPress: () => onDelete(itemToEdit.id),
                    },
                  ]);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.deleteButtonText}>削除する</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* サイクルルール設定モーダル */}
        <CycleRuleSettingModal
          visible={showCycleRuleSettingModal}
          onClose={() => setShowCycleRuleSettingModal(false)}
          onSave={(rule) => {
            setCycleRuleType(rule);
            setShowCycleRuleSettingModal(false);
            setErrors((prev) => ({ ...prev, cycle: undefined }));
          }}
          initialCycle={cycleRuleType}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default RegularIncomeAndExpenseForm;

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    alignItems: "stretch", // 子供を横いっぱいに広げる
  },
  card: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginVertical: 10,
    // marginHorizontal: 20 などで、画面の端とカードの間に隙間を作る
    marginHorizontal: Platform.OS === "ios" ? 16 : 10,
    width: "auto", // これでmaxWidthなどを気にせず画面幅いっぱいまで広がる
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
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
    marginTop: 4,
  },
  cycleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 4,
    borderWidth: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    borderRadius: 10,
    paddingVertical: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 12,
  },

  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
});
