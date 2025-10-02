// screens/HomeScreen.tsx
import React, { useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";
import { useTheme } from "../contexts/ThemeContext";

interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
}

const CATEGORY_LIST = [
  "食費",
  "交通",
  "娯楽",
  "日用品",
  "その他",
  "医療",
  "教育",
  "交際",
];

export default function HomeScreen() {
  const targetSavings = 500000;
  const remainingDays = 120;
  const todayUsable = 3500;
  const totalDays = 150;

  const [expense, setExpense] = useState("");
  const [category, setCategory] = useState(CATEGORY_LIST[0]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const inputRef = useRef<TextInput>(null);

  const { theme } = useTheme();
  const c = colors[theme];

  const progress = (totalDays - remainingDays) / totalDays;

  const handleAddExpense = () => {
    if (!expense) return;

    const newExpense: Expense = {
      id: String(Date.now()),
      amount: parseInt(expense, 10),
      date: new Date().toLocaleDateString(),
      category,
    };

    setExpenses([newExpense, ...expenses]);
    setExpense("");
    inputRef.current?.blur();
  };

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    CATEGORY_LIST.forEach((c) => (totals[c] = 0));
    expenses.forEach((e) => {
      totals[e.category] += e.amount;
    });
    return totals;
  }, [expenses]);

  const maxAmount = Math.max(...Object.values(categoryTotals), 1);

  return (
    <SafeAreaLayout style={{ backgroundColor: c.background, flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        {/* 今日使える金額 */}
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <Text style={[styles.label, { color: c.text }]}>今日使える金額</Text>
          <Text style={[styles.mainAmount, { color: c.accent }]}>
            ¥{todayUsable.toLocaleString()}
          </Text>
        </View>

        {/* 支出登録 */}
        <View style={[styles.inputCard, { backgroundColor: c.card }]}>
          <Text style={[styles.label, { color: c.text }]}>支出を登録</Text>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { borderColor: c.border, color: c.text }]}
              placeholder="金額を入力"
              placeholderTextColor={c.placeholder}
              keyboardType="numeric"
              value={expense}
              onChangeText={setExpense}
            />
          </View>

          <View style={styles.buttonRow}>
            {CATEGORY_LIST.slice(0, 5).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: category === cat ? c.accent : c.secondary,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { fontSize: 14, color: category === cat ? "#fff" : c.text },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: c.success }]}
            onPress={handleAddExpense}
          >
            <Text style={styles.buttonText}>登録</Text>
          </TouchableOpacity>
        </View>

        {/* カテゴリー別棒グラフ */}
        <View style={[styles.card, { backgroundColor: c.card, flex: 1 }]}>
          <Text style={[styles.label, { color: c.text, marginBottom: 12 }]}>
            カテゴリー別支出
          </Text>

          <FlatList
            data={CATEGORY_LIST}
            keyExtractor={(item) => item}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.barRow}>
                <Text style={[styles.subAmount, { width: 60, color: c.text }]}>
                  {item}
                </Text>
                <View
                  style={[
                    styles.barBackground,
                    { backgroundColor: c.secondary },
                  ]}
                >
                  <View
                    style={{
                      width: `${(categoryTotals[item] / maxAmount) * 100}%`,
                      backgroundColor: c.accent,
                      height: "100%",
                      borderRadius: 5,
                    }}
                  />
                </View>
                <Text
                  style={[
                    styles.subAmount,
                    { width: 70, textAlign: "right", color: c.text },
                  ]}
                >
                  ¥{categoryTotals[item].toLocaleString()}
                </Text>
              </View>
            )}
          />
        </View>

        {/* 目標貯金額 + 残り日数 */}
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <Text style={[styles.label, { color: c.text }]}>目標貯金額</Text>
          <Text style={[styles.subAmount, { color: c.text }]}>
            ¥{targetSavings.toLocaleString()}
          </Text>

          <Text style={[styles.label, { marginTop: 12, color: c.text }]}>
            残り日数
          </Text>
          <Text style={[styles.subAmount, { color: c.text }]}>
            {remainingDays}日
          </Text>

          <View
            style={[styles.progressContainer, { backgroundColor: c.secondary }]}
          >
            <View
              style={[
                styles.progressBar,
                { width: `${progress * 100}%`, backgroundColor: c.accent },
              ]}
            />
          </View>
        </View>
      </View>
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  label: {
    fontSize: 17,
    fontWeight: "500",
  },
  mainAmount: {
    fontSize: 40,
    fontWeight: "700",
  },
  subAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputCard: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  button: {
    alignSelf: "stretch",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  barBackground: {
    flex: 1,
    height: 16,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  progressContainer: {
    marginTop: 16,
    height: 10,
    width: "100%",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
});
