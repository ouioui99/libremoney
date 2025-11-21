// components/onboarding/PageInventory.tsx
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function PageInventory() {
  const [text, setText] = useState("");

  return (
    <View style={styles.page}>
      <Text style={styles.title}>在庫を簡単管理</Text>

      <Text style={styles.description}>
        冷蔵庫に入っている食品の名前を入力してみてください。
      </Text>

      <TextInput
        placeholder="例：牛乳、卵など"
        style={styles.input}
        value={text}
        onChangeText={setText}
      />
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
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    fontSize: 16,
  },
});
