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

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const { theme } = useTheme();
  const c = colors[theme];

  // ★ PageRecipe の入力が揃っているか（true なら進める）
  const [canMoveNext, setCanMoveNext] = useState(false);

  const handleNext = () => {
    // ▼ 2ページ目（index 1）で未入力なら進行禁止
    if (page === 1 && !canMoveNext) return;

    if (page < 2) {
      pagerRef.current?.setPage(page + 1);
    } else {
      navigation.replace("MainTabs");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.card }]}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        scrollEnabled={page === 1 ? canMoveNext : true} // ★ スワイプも制御
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        <PageWelcome key="p1" />

        {/* ★ 入力が揃っているか親へ通知 */}
        <PageRecipe key="p2" onValidityChange={setCanMoveNext} />

        <PageInventory key="p3" />
      </PagerView>

      {/* インジケーター */}
      <View style={styles.indicatorContainer}>
        {[0, 1, 2].map((i) => (
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
        style={[
          styles.button,
          { backgroundColor: c.accent },
          page === 1 && !canMoveNext && { opacity: 0.4 }, // ★ 未入力時は薄く
        ]}
        disabled={page === 1 && !canMoveNext}
        onPress={handleNext}
      >
        <Text style={styles.buttonText}>
          {page === 2 ? "開始する" : "次へ"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
