import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";
import CustumHeader from "../components/CustomHeader";
import CategorySelector from "../components/CategorySelector";
import {
  handleCategoryDelete,
  handleCategoryEditOnSave,
  handleCategoryReorder,
} from "../util/categoryUtils";
import { STORAGE_KEYS } from "../util/constants";
import { Category } from "../types/models";

type RegularIncome = {
  id: string;
  amount: number;
  memo: string;
  categoryId: string;
  cycleRule: string;
};

export default function ManageRegularIncomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const c = colors[theme];

  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<RegularIncome[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryListModal, setShowCategoryListModal] = useState(false);

  useEffect(() => {
    loadIncomes();
    loadCategories();
  }, []);

  const loadIncomes = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REGULARLY_INCOMES);
      if (data) setIncomes(JSON.parse(data));
    } catch (e) {
      console.error("収入データの読み込みに失敗:", e);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INCOME_CATEGORIES);
      if (data) setCategories(JSON.parse(data));
    } catch (e) {
      console.error("カテゴリー読み込みエラー:", e);
    }
  };

  const saveIncomes = async (newList: RegularIncome[]) => {
    setIncomes(newList);
    await AsyncStorage.setItem(
      STORAGE_KEYS.REGULARLY_INCOMES,
      JSON.stringify(newList)
    );
  };

  const handleAdd = () => {
    if (!amount) return Alert.alert("入力エラー", "金額を入力してください。");

    const newIncome: RegularIncome = {
      id: Date.now().toString(),
      amount: Number(amount),
      memo,
      categoryId,
      cycleRule: "月1回",
    };

    const updated = [...incomes, newIncome];
    saveIncomes(updated);
    setAmount("");
    setMemo("");
    setCategoryId("");
  };

  const handleDelete = (id: string) => {
    Alert.alert("削除確認", "この収入を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          const filtered = incomes.filter((item) => item.id !== id);
          saveIncomes(filtered);
        },
      },
    ]);
  };

  const selectedCategory = categories.find((cat) => cat.id === categoryId);

  return (
    <SafeAreaLayout
      style={[styles.container, { backgroundColor: c.background }]}
    >
      {/* ヘッダー */}
      <CustumHeader title="定期収入設定" navigation={navigation} />

      {/* 追加フォーム */}
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 8,
        }}
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
              style={[styles.input, { color: c.text, borderColor: c.border }]}
            />

            {/* メモ */}
            <Text style={[styles.label, { color: c.text, marginTop: 12 }]}>
              メモ
            </Text>
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder="例: 基本給"
              placeholderTextColor={c.placeholder}
              style={[styles.input, { color: c.text, borderColor: c.border }]}
            />

            {/* カテゴリー選択 */}
            <Text style={[styles.label, { color: c.text, marginTop: 12 }]}>
              カテゴリー
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              style={[
                styles.categoryButton,
                { backgroundColor: c.secondary, borderColor: c.border },
              ]}
            >
              <Text style={{ color: c.text }}>
                {selectedCategory ? selectedCategory.name : "カテゴリーを選択"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={c.text} />
            </TouchableOpacity>

            {/* サイクルルール */}
            <TouchableOpacity
              style={[styles.cycleButton, { backgroundColor: c.secondary }]}
              onPress={() => navigation.navigate("CycleRuleScreen")}
            >
              <Ionicons name="repeat-outline" size={18} color={c.text} />
              <Text style={{ color: c.text, marginLeft: 6 }}>
                サイクルルールを設定
              </Text>
            </TouchableOpacity>

            {/* 追加ボタン */}
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: c.accent }]}
              onPress={handleAdd}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>追加</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* カテゴリーセレクター */}
      <CategorySelector
        categories={categories}
        setCategories={setCategories}
        selectedCategoryId={categoryId}
        onSelect={(id: string) => setCategoryId(id)}
        onReorder={handleCategoryReorder}
        onDelete={handleCategoryDelete}
        onEditSave={handleCategoryEditOnSave}
        showCategoryModal={showCategoryModal}
        setShowCategoryModal={setShowCategoryModal}
        showCategoryListModal={showCategoryListModal}
        setShowCategoryListModal={setShowCategoryListModal}
        type="income"
      />

      {/* 支出一覧 */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: c.background,
          borderBottomWidth: 1,
          borderBottomColor:
            theme === "dark" ? `${c.secondary}40` : `${c.secondary}80`,
        }}
      >
        <Ionicons name="cash-outline" size={20} color={c.accent} />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: c.text,
            marginLeft: 6,
          }}
        >
          定期収入一覧
        </Text>
      </View>

      <FlatList
        data={incomes}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item, index }) => {
          const category = categories.find((c) => c.id === item.categoryId);
          const backgroundColor =
            index % 2 !== 0
              ? c.card
              : theme === "dark"
              ? `${c.secondary}60`
              : `${c.secondary}90`;

          return (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "収入詳細",
                  `${item.memo || "メモなし"}\n${
                    category?.name ?? "未設定"
                  }\n${item.amount.toLocaleString()} 円 / ${item.cycleRule}`
                )
              }
            >
              <View
                style={[
                  styles.incomeItem,
                  {
                    backgroundColor,
                    paddingHorizontal: 12,
                    borderBottomWidth: index === incomes.length - 1 ? 0 : 0.6,
                    borderBottomColor: c.border,
                  },
                ]}
              >
                {/* 上段：金額とカテゴリ */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={[styles.amountText, { color: c.text }]}>
                    ¥{item.amount.toLocaleString()}
                  </Text>

                  {category && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name={category.icon || "wallet-outline"}
                        size={18}
                        color={c.accent}
                      />
                      <Text style={[styles.categoryText, { color: c.accent }]}>
                        {category.name}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 下段：メモとサイクル */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{
                      color: c.placeholder,
                      fontSize: 14,
                    }}
                    numberOfLines={1}
                  >
                    📝 {item.memo || "メモなし"}
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="repeat-outline"
                      size={14}
                      color={c.placeholder}
                      style={{ marginRight: 2 }}
                    />
                    <Text style={{ color: c.placeholder, fontSize: 13 }}>
                      {item.cycleRule}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text
            style={{
              color: c.placeholder,
              textAlign: "center",
              marginTop: 40,
              fontSize: 15,
            }}
          >
            まだ定期収入が登録されていません
          </Text>
        }
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  card: {
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
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  itemText: { fontSize: 16, fontWeight: "600" },
  incomeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  incomeLeft: {
    flex: 1,
    marginRight: 8,
  },
  memoText: {
    fontSize: 16,
    fontWeight: "600",
  },

  incomeRight: {
    alignItems: "flex-end",
    marginRight: 8,
  },
  cycleText: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    padding: 6,
  },
  incomeItem: {
    flexDirection: "column",
    borderRadius: 0, // ← 並んだ時に自然に見えるよう角丸を外す
    paddingVertical: 10,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
