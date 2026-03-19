import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onAllow: () => void;
  onSkip: () => void;
};

const TrackingModal = ({ visible, onAllow, onSkip }: Props) => {
  const { theme } = useTheme();
  const c = colors[theme];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.modal,
            {
              backgroundColor: c.card,
              borderColor: c.border,
            },
          ]}
        >
          {/* アイコン */}
          <View
            style={[styles.iconWrapper, { backgroundColor: `${c.accent}20` }]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={28}
              color={c.accent}
            />
          </View>

          {/* タイトル */}
          <Text style={[styles.title, { color: c.text }]}>
            無料で使い続けるために
          </Text>

          {/* 説明 */}
          <Text style={[styles.description, { color: c.subText }]}>
            このアプリは広告収益で運営されています。
            {"\n"}
            許可すると、あなたに合った広告が表示され、
            より快適にご利用いただけます。
          </Text>

          {/* ボタン */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: c.accent }]}
            onPress={onAllow}
          >
            <Text style={[styles.primaryText, { color: c.textOnAccent }]}>
              無料で続ける
            </Text>
          </TouchableOpacity>

          {/* スキップ */}
          <TouchableOpacity onPress={onSkip}>
            <Text style={[styles.skipText, { color: c.placeholder }]}>
              あとで
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TrackingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // 少し濃く
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modal: {
    width: "100%",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderWidth: 1,
    alignItems: "center",
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  skipText: {
    fontSize: 13,
  },
});
