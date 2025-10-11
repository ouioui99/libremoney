import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import * as Haptics from "expo-haptics";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import SafeAreaLayout from "./SafeAreaLayout";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function CategoryEditModal({ visible, onClose }: Props) {
  const { theme } = useTheme();
  const c = colors[theme];
  const insets = useSafeAreaInsets();

  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "食費" },
    { id: "2", name: "外食費" },
    { id: "3", name: "日用品" },
    { id: "4", name: "交通費" },
    { id: "5", name: "衣服" },
    { id: "6", name: "交際費" },
    { id: "7", name: "趣味" },
    { id: "8", name: "その他" },
  ]);

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const handleAdd = () => {
    const newName = `新しいカテゴリ${categories.length + 1}`;
    setCategories((prev) => [
      ...prev,
      { id: String(Date.now()), name: newName },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaLayout style={{ flex: 1, backgroundColor: c.accent }}>
        <View style={{ backgroundColor: c.background, flex: 1 }}>
          {/* ヘッダー */}
          <View
            style={{
              backgroundColor: c.accent,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: "#fff", fontSize: 16 }}>閉じる</Text>
            </TouchableOpacity>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              カテゴリー編集
            </Text>
            <View style={{ width: 50 }} />
          </View>

          {/* ヒント */}
          {/* <View
            style={{
              backgroundColor: c.secondary,
              paddingVertical: 6,
              paddingHorizontal: 12,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: c.text, fontSize: 12 }}>↓ 削除ボタン</Text>
          </View> */}

          {/* ドラッグ可能なリスト */}
          <DraggableFlatList
            style={{ marginTop: 10, marginBottom: 55 }}
            data={categories}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => setCategories(data)}
            renderItem={({ item, drag, isActive }) => (
              <ScaleDecorator>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onLongPress={async () => {
                    await Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Medium
                    );
                    drag();
                  }}
                  onPress={(item) => {
                    console.log(item.target);
                  }}
                  disabled={isActive}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border,
                    backgroundColor: isActive ? c.secondary : c.background,
                  }}
                >
                  {/* 削除ボタン */}
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={{ marginRight: 10, padding: 4 }}
                  >
                    <Ionicons name="remove-circle" size={22} color={c.error} />
                  </TouchableOpacity>

                  {/* 名前 */}
                  <Text style={{ flex: 1, color: c.text, fontSize: 16 }}>
                    {item.name}
                  </Text>

                  {/* ドラッグハンドル */}
                  <Ionicons
                    name="reorder-three-outline"
                    size={24}
                    color={c.placeholder}
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </ScaleDecorator>
            )}
            contentContainerStyle={{
              paddingBottom: 100, // ボタン分の余白
            }}
          />

          {/* ✅ 画面下固定の「カテゴリー追加」ボタン */}
          <TouchableOpacity
            onPress={handleAdd}
            style={[
              styles.fixedAddButton,
              {
                backgroundColor: c.secondary,
                borderTopColor: c.border,
                bottom: insets.bottom, // SafeArea対応
              },
            ]}
          >
            <Text style={{ color: c.text, fontSize: 16 }}>カテゴリー追加</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaLayout>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fixedAddButton: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
});
