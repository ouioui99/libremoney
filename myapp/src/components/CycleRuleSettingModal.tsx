import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
  Modal,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import SafeAreaLayout from "../components/SafeAreaLayout";
import { CycleRule } from "../types/models";

type CycleRuleSettingModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (cycle: "weekly" | "monthly" | "yearly") => void;
  initialCycle?: CycleRule["type"];
};

const CycleRuleSettingModal: React.FC<CycleRuleSettingModalProps> = ({
  visible,
  onClose,
  onSave,
  initialCycle,
}) => {
  const { theme } = useTheme();
  const c = colors[theme];
  const [selectedCycle, setSelectedCycle] = useState<
    CycleRule["type"] | undefined
  >(initialCycle);

  const slideAnim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = visible
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 開くときのアニメーション
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 閉じるアニメーション
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSelect = (cycle: "weekly" | "monthly" | "yearly") => {
    setSelectedCycle(cycle);
  };

  const handleSave = () => {
    if (!selectedCycle) return;
    onSave(selectedCycle);
    onClose();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0], // 下からスライド
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* 背景フェード */}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: opacityAnim, backgroundColor: "#00000060" },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* モーダル本体 */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY }],
            backgroundColor: c.background,
            shadowColor: c.text,
          },
        ]}
      >
        <SafeAreaLayout>
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: c.text }]}>
              収入サイクル設定
            </Text>
            <Text style={[styles.subtitle, { color: c.placeholder }]}>
              定期収入の繰り返しルールを選択してください
            </Text>
          </View>

          {/* 選択肢 */}
          <View style={styles.optionContainer}>
            {[
              {
                key: "weekly",
                label: "週1（毎週）",
                icon: "calendar-outline" as keyof typeof Ionicons.glyphMap,
              },
              {
                key: "monthly",
                label: "月1（毎月）",
                icon: "calendar-number-outline" as keyof typeof Ionicons.glyphMap,
              },
              {
                key: "yearly",
                label: "年1（毎年）",
                icon: "calendar-outline" as keyof typeof Ionicons.glyphMap, // fallback icon for yearly
              },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => handleSelect(opt.key as any)}
                style={[
                  styles.option,
                  {
                    backgroundColor:
                      selectedCycle === opt.key ? c.accent : c.card,
                    borderColor:
                      selectedCycle === opt.key ? c.accent : c.border,
                  },
                ]}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name={opt.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={selectedCycle === opt.key ? c.background : c.text}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          selectedCycle === opt.key ? c.background : c.text,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ボタンエリア */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelButton, { borderColor: c.border }]}
            >
              <Text style={{ color: c.text }}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: selectedCycle ? c.accent : c.border,
                  shadowColor: c.accent,
                },
              ]}
              disabled={!selectedCycle}
              onPress={handleSave}
            >
              <Text style={{ color: c.background, fontWeight: "600" }}>
                保存
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaLayout>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  optionContainer: {
    gap: 12,
  },
  option: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
});

export default CycleRuleSettingModal;
