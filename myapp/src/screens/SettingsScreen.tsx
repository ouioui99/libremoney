import React, { useState } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import SafeAreaLayout from "../components/SafeAreaLayout";
import { colors } from "../theme/colors";

export default function SettingsScreen() {
  const { theme, setMode, mode } = useTheme();
  const c = colors[theme];
  const [isDarkMode, setIsDarkMode] = useState(mode === "dark");

  const toggleTheme = () => {
    const newMode = isDarkMode ? "light" : "dark";
    setMode(newMode);
    setIsDarkMode(!isDarkMode);
  };

  const handleIncomeSettings = () => console.log("収入設定を開く");
  const handleRegularExpenseSettings = () => console.log("定期支出設定を開く");

  type SettingsItem = {
    key: string;
    label: string;
    type: "toggle" | "info" | "link";
    value?: boolean | string;
    onToggle?: () => void;
    onPress?: () => void;
  };

  const sections: { title: string; data: SettingsItem[] }[] = [
    {
      title: "収入・支出設定",
      data: [
        {
          key: "income",
          label: "月収を設定",
          type: "link",
          onPress: handleIncomeSettings,
        },
        {
          key: "regular-expense",
          label: "定期的な支出を登録",
          type: "link",
          onPress: handleRegularExpenseSettings,
        },
      ],
    },
    {
      title: "表示設定",
      data: [
        {
          key: "theme",
          label: "ダークモード",
          type: "toggle",
          value: isDarkMode,
          onToggle: toggleTheme,
        },
      ],
    },
    {
      title: "アプリ情報",
      data: [
        {
          key: "version",
          label: "バージョン",
          type: "info",
          value: "1.0.0",
        },
      ],
    },
  ];

  return (
    <SafeAreaLayout style={{ flex: 1, backgroundColor: c.background }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.key}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: c.placeholder }]}>
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={item.type !== "link"}
            onPress={item.onPress}
            activeOpacity={item.type === "link" ? 0.6 : 1}
          >
            <View
              style={[styles.itemContainer, { borderBottomColor: c.border }]}
            >
              <Text style={[styles.itemLabel, { color: c.text }]}>
                {item.label}
              </Text>

              {item.type === "toggle" ? (
                <Switch
                  value={!!item.value}
                  onValueChange={item.onToggle}
                  thumbColor={item.value ? c.accent : "#f4f3f4"}
                  trackColor={{ true: `${c.accent}66`, false: "#ccc" }}
                />
              ) : item.type === "info" ? (
                <Text style={[styles.itemValue, { color: c.placeholder }]}>
                  {item.value}
                </Text>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={c.placeholder}
                />
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingTop: 4 }}
        SectionSeparatorComponent={() => <View style={{ height: 5 }} />} // 👈 各セクションの間も詰め気味
      />
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 2, // 👈 ここを詰めた
    marginLeft: 16,
    textTransform: "uppercase",
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLabel: {
    fontSize: 16,
  },
  itemValue: {
    fontSize: 14,
  },
});
