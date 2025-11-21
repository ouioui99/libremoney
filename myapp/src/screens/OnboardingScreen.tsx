import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import PagerView from "react-native-pager-view";
import { RootStackParamList } from "../types/navigation";
import PageInventory from "../components/onboarding/PageInventory";
import PageRecipe from "../components/onboarding/PageRecipe";
import PageWelcome from "../components/onboarding/PageWelcome";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";

const { width } = Dimensions.get("window");

const pages = [
  {
    title: "ようこそ！",
    description: "このアプリでは、在庫管理やレシピ登録が簡単にできます。",
  },
  {
    title: "在庫を簡単管理",
    description: "冷蔵庫の中身をスマホでさっと確認できます。",
  },
  {
    title: "レシピも自動登録",
    description: "URLを貼るだけで材料を自動抽出できます。",
  },
];

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const { theme } = useTheme();
  const c = colors[theme];

  const pages = [
    <PageWelcome key="p1" />,
    <PageInventory key="p2" />,
    <PageRecipe key="p3" />,
  ];

  const handleNext = () => {
    if (page < pages.length - 1) {
      pagerRef.current?.setPage(page + 1);
    } else {
      navigation.replace("MainTabs");
    }
  };

  return (
    <View style={[styles.container, , { backgroundColor: c.card }]}>
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        {pages.map((p) => p)}
      </PagerView>

      {/* インジケーター */}
      <View style={styles.indicatorContainer}>
        {pages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.indicator,
              page === i
                ? [styles.indicatorActive, { backgroundColor: c.accent }]
                : undefined,
            ]}
          />
        ))}
      </View>

      {/* 次へ / 開始する */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.accent }]}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
          {page === pages.length - 1 ? "開始する" : "次へ"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pager: {
    flex: 1,
  },
  page: {
    justifyContent: "center",
    alignItems: "center",
    width: width,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    color: "#444",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
    borderRadius: 4,
  },
  indicatorActive: {
    backgroundColor: "#333",
    width: 20,
  },
  button: {
    backgroundColor: "#1E88E5",
    paddingVertical: 14,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
