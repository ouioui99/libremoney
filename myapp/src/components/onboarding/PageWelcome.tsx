// components/onboarding/PageWelcome.tsx

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { colors } from "../../theme/colors";
import { useTheme } from "../../contexts/ThemeContext";

const { width } = Dimensions.get("window");

export default function PageWelcome() {
  const { theme } = useTheme();
  const c = colors[theme];
  return (
    <View style={[styles.page, { backgroundColor: c.card }]}>
      <Text style={[styles.title, { color: c.text }]}>ようこそ！</Text>

      <Text style={[styles.description, { color: c.text }]}>
        目標貯金額と期限を設定するだけで、 毎日使えるお金がすぐにわかります。
        無理な節約は不要。自由に使いながら自然に貯金できます。
      </Text>
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
    fontSize: 32, // ← 少し大きくして印象アップ
    fontWeight: "bold",
    marginBottom: 24, // ← タイトルと説明の余白を広げる
  },
  description: {
    fontSize: 18, // ← 読みやすい大きさ
    textAlign: "center",
    color: "#333", // ← 少し濃い色で視認性向上
    lineHeight: 28, // ← 行間をゆったり
    maxWidth: 320, // ← 横幅を読みやすい幅に制限
  },
});
