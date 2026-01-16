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
      </Text>

      <Text style={[styles.description, { color: c.text }]}>
        無理な節約は不要。 自由に使いながら自然に貯金できます。
      </Text>

      <Text style={[styles.privacyNote, { color: c.subText }]}>
        ※ データはすべて端末内にのみ保存されるため、
        機内モードでも使用可能です。
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32, // タイトルと本文の余白を少し広げる
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 30, // ← 行間を広めに
    maxWidth: 320,
    marginBottom: 12, // ← 段落間の余白
  },
  privacyNote: {
    marginTop: 24, // 本文との距離
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22, // 注釈は詰めすぎない
  },
});
