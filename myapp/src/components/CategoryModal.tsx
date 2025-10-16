// components/CategoryModal.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface Props {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onSelect: (category: string) => void;
  onEdit: () => void; // 追加/編集ボタンのコールバック
}

export default function CategoryModal({
  visible,
  categories,
  onClose,
  onSelect,
  onEdit,
}: Props) {
  const { theme } = useTheme();
  const c = colors[theme];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: c.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingVertical: 20,
              paddingHorizontal: 15,
              maxHeight: "60%",
            }}
          >
            {/* ヘッダー */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: c.text,
                  fontWeight: "600",
                }}
              >
                カテゴリーを選択
              </Text>

              <TouchableOpacity
                onPress={() => {
                  onEdit();
                }}
                style={{
                  position: "absolute",
                  right: 0,
                }}
              >
                <Text style={{ color: c.text, fontSize: 18 }}>追加/編集</Text>
              </TouchableOpacity>
            </View>

            {/* カテゴリーリスト */}
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border || "#ccc",
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={c.text}
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ color: c.text, fontSize: 18 }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={onClose}
              style={{
                marginTop: 15,
                paddingVertical: 12,
                backgroundColor: c.accent,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: c.text,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                閉じる
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
