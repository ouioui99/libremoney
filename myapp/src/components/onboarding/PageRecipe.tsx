// components/onboarding/PageRecipe.tsx
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function PageRecipe() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>レシピも自動登録</Text>
      <Text style={styles.description}>
        URLを貼るだけで材料を自動抽出できます。
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
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    lineHeight: 22,
  },
});
