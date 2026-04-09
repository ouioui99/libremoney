import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onBack: () => void;
};

export default function ConfirmRegistRegularModal({
  visible,
  onConfirm,
  onBack,
}: Props) {
  const { theme } = useTheme();
  const c = colors[theme];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: c.card }]}>
          {/* アイコン */}
          <View style={[styles.iconCircle, { backgroundColor: c.secondary }]}>
            <Ionicons name="alert-circle-outline" size={28} color={c.accent} />
          </View>

          {/* タイトル */}
          <Text style={[styles.title, { color: c.text }]}>
            定期収入・定期支出が未設定です
          </Text>

          {/* 説明 */}
          <Text style={[styles.message, { color: c.placeholder }]}>
            定期収入,定期支出が登録されていません。
            {"\n"}使用できる金額の算出には
            {"\n"}定期収入と定期支出の登録が必要です。
          </Text>

          {/* ボタン */}
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onBack}
              style={[styles.backButton, { borderColor: c.border }]}
            >
              <Text style={{ color: c.text, fontWeight: "600" }}>あとで</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={[styles.confirmButton, { backgroundColor: c.accent }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                登録に進む
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  modal: {
    width: "82%",
    borderRadius: 18,
    padding: 26,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 20,
  },

  buttons: {
    flexDirection: "row",
    width: "100%",
  },

  backButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 8,
  },

  confirmButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 8,
  },
});
