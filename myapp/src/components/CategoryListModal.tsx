import React from "react";
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
import CategoryEditModal from "./CategoryEditModal";
import { Category } from "../types/models";

interface Props {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  onDelete: (id: string) => void;
  onReorder: (newCategories: Category[]) => void;
  showCategoryEditModal: boolean;
  setShowCategoryEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleCategoryEditOnsave: (category: { icon: string; name: string }) => void;
}

export default function CategoryListModal({
  visible,
  onClose,
  categories,
  onDelete,
  onReorder,
  showCategoryEditModal,
  setShowCategoryEditModal,
  handleCategoryEditOnsave,
}: Props) {
  const { theme } = useTheme();
  const c = colors[theme];
  const insets = useSafeAreaInsets();

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
            // 固定の一意キーに id を使う（order は可変なので避ける）
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => {
              // 並び替え後に order を振り直して親に渡す（親はこれを保存して state 更新する）
              const updated = data.map((item, idx) => ({
                ...item,
                order: String(idx + 1),
              }));
              onReorder(updated);
            }}
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
                  {/* 左：削除ボタン */}
                  <TouchableOpacity
                    onPress={() => onDelete(item.id)}
                    style={{ marginRight: 12, padding: 4 }}
                  >
                    <Ionicons name="remove-circle" size={22} color={c.error} />
                  </TouchableOpacity>

                  {/* 左：カテゴリーアイコン */}
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={c.placeholder}
                    style={{ marginRight: 10 }}
                  />

                  {/* 中央：カテゴリ名 */}
                  <Text
                    style={{
                      flex: 1,
                      color: c.text,
                      fontSize: 16,
                    }}
                  >
                    {item.name}
                  </Text>

                  {/* 右：ドラッグハンドル */}
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
            onPress={() => setShowCategoryEditModal(true)}
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
          <CategoryEditModal
            visible={showCategoryEditModal}
            onClose={() => setShowCategoryEditModal(false)}
            onSave={handleCategoryEditOnsave}
          />
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
