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
import { DISPLAY_TITLE, STORAGE_KEYS } from "../util/constants";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";
import CustumHeader from "../components/CustomHeader";

type RegularIncome = {
  id: string;
  source: string; // 収入元
  amount: number;
  cycle: string; // 月1回、週1回など
};

export default function ManageRegularIncomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const c = colors[theme];
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState("月1回");
  const [incomes, setIncomes] = useState<RegularIncome[]>([]);

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INCOMES);
      if (data) setIncomes(JSON.parse(data));
    } catch (e) {
      console.error("収入データの読み込みに失敗:", e);
    }
  };

  const saveIncomes = async (newList: RegularIncome[]) => {
    setIncomes(newList);
    await AsyncStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(newList));
  };

  const handleAdd = () => {
    if (!source || !amount)
      return Alert.alert("入力エラー", "収入元と金額を入力してください。");
    const newIncome: RegularIncome = {
      id: Date.now().toString(),
      source,
      amount: Number(amount),
      cycle,
    };
    const updated = [...incomes, newIncome];
    saveIncomes(updated);
    setSource("");
    setAmount("");
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

  return (
    <SafeAreaLayout style={{ flex: 1, backgroundColor: c.background }}>
      {/* ヘッダー */}
      <CustumHeader
        title={DISPLAY_TITLE.manageRegularIncomeScreen}
        navigation={navigation}
      />

      {/* 追加フォーム */}
      <View style={[styles.card, { backgroundColor: c.card }]}>
        <Text style={[styles.label, { color: c.text }]}>収入元</Text>
        <TextInput
          value={source}
          onChangeText={setSource}
          placeholder="例: 給料"
          placeholderTextColor={c.placeholder}
          style={[styles.input, { color: c.text, borderColor: c.border }]}
        />

        <Text style={[styles.label, { color: c.text, marginTop: 12 }]}>
          金額
        </Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="例: 250000"
          keyboardType="numeric"
          placeholderTextColor={c.placeholder}
          style={[styles.input, { color: c.text, borderColor: c.border }]}
        />

        <Text style={[styles.label, { color: c.text, marginTop: 12 }]}>
          サイクル
        </Text>
        <View style={[styles.cycleRow]}>
          {["月1回", "週1回", "年1回"].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.cycleButton,
                {
                  backgroundColor: cycle === option ? c.accent : c.secondary,
                },
              ]}
              onPress={() => setCycle(option)}
            >
              <Text
                style={{
                  color: cycle === option ? "#fff" : c.text,
                  fontWeight: "600",
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: c.accent }]}
          onPress={handleAdd}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>追加</Text>
        </TouchableOpacity>
      </View>

      {/* 収入リスト */}
      <FlatList
        data={incomes}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: c.secondary }]}>
            <View>
              <Text style={[styles.itemText, { color: c.text }]}>
                {item.source}（{item.cycle}）
              </Text>
              <Text style={{ color: c.placeholder }}>
                {item.amount.toLocaleString()} 円
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={20} color={"red"} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
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
  cycleRow: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-between",
  },
  cycleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
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
});
