// components/RegularIncomeList.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RegularIncome, Category } from "../types/models";

type Props = {
  incomes: RegularIncome[];
  categories: Category[];
  theme: "light" | "dark";
  colors: any;
  onDelete: (id: string) => void;
  type: string;
};

export default function RegularIncomeAndExpenseList({
  incomes,
  categories,
  theme,
  colors: c,
  onDelete,
  type,
}: Props) {
  return (
    <>
      {/* ヘッダー */}
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
          定期{type}一覧
        </Text>
      </View>

      {/* FlatList */}
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
                  }\n${item.amount.toLocaleString()} 円 / ${
                    item.cycleRule.type
                  }`,
                  [
                    { text: "閉じる" },
                    {
                      text: "削除",
                      style: "destructive",
                      onPress: () => onDelete(item.id),
                    },
                  ]
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
                {/* 上段 */}
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

                {/* 下段 */}
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
                      {item.cycleRule.type}
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
            まだ定期{type}が登録されていません
          </Text>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  incomeItem: {
    flexDirection: "column",
    borderRadius: 0,
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
