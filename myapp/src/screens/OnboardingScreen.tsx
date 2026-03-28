//TODO バリデーション関係はTargetSettingで完結させるように修正する

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
import RegularIncomeSetting from "../components/onboarding/RegularIncomeSetting";
import PageWelcome from "../components/onboarding/PageWelcome";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import TargetSetting from "../components/onboarding/TargetSetting";
import RegularExpenseSetting from "../components/onboarding/RegularExpenseSetting";

const { width } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const { theme } = useTheme();
  const c = colors[theme];

  const [canMoveNext, setCanMoveNext] = useState(false);

  const [showFieldError, setShowFieldError] = useState(false);
  const [edditFinish, setEdditFinish] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNext = () => {
    if (page === 1) {
      setSubmitting(true);
    } else if (page !== 1 && page < 3) {
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
        scrollEnabled={page === 1 ? canMoveNext : true}
        onPageSelected={(e) => setPage(e.nativeEvent.position)}
      >
        <PageWelcome key="p1" />

        {/* ★ エラー状態を子へ渡す */}
        <TargetSetting
          key="p2"
          edditFinish={edditFinish}
          setEdditFinish={setEdditFinish}
          onValidityChange={(isValid) => {
            setCanMoveNext(isValid);
            if (isValid) setShowFieldError(false);
          }}
          onComplete={() => {
            // Confirm → OK のときだけ呼ばれる
            pagerRef.current?.setPage(page + 1);
          }}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />

        <RegularExpenseSetting key="p3" />
        <RegularIncomeSetting key="p4" />
      </PagerView>

      {/* インジケーター */}
      <View style={styles.indicatorContainer}>
        {[0, 1, 2, 3].map((i) => (
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
          {
            backgroundColor: c.operator,
          },
        ]}
        onPress={() => {
          handleNext();
        }}
      >
        <Text style={styles.buttonText}>
          {page === 1 ? "設定する" : page === 3 ? "開始する" : "次へ"}
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
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
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
  errorText: {
    textAlign: "center",
    marginBottom: 14,
    fontSize: 14,
  },
});
