import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";

export default function CustomHeader({
  title,
  navigation,
  type,
}: {
  title: string;
  navigation: any;
  type?: "income" | "expense";
}) {
  const { theme } = useTheme();
  const c = colors[theme];

  return (
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

      <Text
        style={[
          styles.headerTitle,
          {
            color:
              type === "income"
                ? c.income
                : type === "expense"
                ? c.expense
                : c.text,
          },
        ]}
      >
        {title}
      </Text>

      {/* バランス用スペーサー */}
      <View style={{ width: 70 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#007AFF",
    fontSize: 17,
    marginLeft: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});
