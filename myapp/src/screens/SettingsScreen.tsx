import React, { useState } from "react";
import { View, Text, Platform, TouchableOpacity, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../contexts/ThemeContext";
import SafeAreaLayout from "../components/SafeAreaLayout";

export default function SettingsScreen() {
  const { setMode, mode } = useTheme();
  return (
    <SafeAreaLayout>
      <View>
        <Button title="ライト" onPress={() => setMode("light")} />
        <Button title="ダーク" onPress={() => setMode("dark")} />
        <Button title="端末に従う" onPress={() => setMode("system")} />

        <View style={{ marginTop: 20 }}>
          <Button title={`現在の設定: ${mode}`} onPress={() => {}} />
        </View>
      </View>
    </SafeAreaLayout>
  );
}
