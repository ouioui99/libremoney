import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
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
import { Category, NewCategoryInput } from "../types/models";

interface Props {
  visible: boolean;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onClose: () => void;
  categories: Category[];
  fileterdCategories: Category[];
  onDelete: (
    id: string,
    setCategories: (value: React.SetStateAction<Category[]>) => void,
    type: "expense" | "income"
  ) => void;
  onReorder: (
    newList: Category[],
    setCategories: (value: React.SetStateAction<Category[]>) => void,
    type: "expense" | "income"
  ) => Promise<void>;
  showCategoryEditModal: boolean;
  setShowCategoryEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleCategoryEditOnsave: (
    categories: Category[],
    setCategories: (value: React.SetStateAction<Category[]>) => void,
    category: NewCategoryInput | Category,
    type: "expense" | "income"
  ) => Promise<void>;
  type: "expense" | "income";
}

export default function CategoryListModal({
  visible,
  setCategories,
  onClose,
  categories,
  fileterdCategories,
  onDelete,
  onReorder,
  showCategoryEditModal,
  setShowCategoryEditModal,
  handleCategoryEditOnsave,
  type,
}: Props) {
  const { theme } = useTheme();
  const c = colors[theme];
  const insets = useSafeAreaInsets();

  // 🟩 編集対象カテゴリを保持
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCategoryPress = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryEditModal(true);
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
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              {type === "expense" ? "支出カテゴリー管理" : "収入カテゴリー管理"}
            </Text>
            <View style={{ width: 50 }} />
          </View>

          {/* リスト */}
          <DraggableFlatList
            style={{ marginTop: 10, marginBottom: 55 }}
            data={fileterdCategories}
            keyExtractor={(item) => item.id}
            onDragEnd={({ data }) => {
              // 1) UI を即時更新してチラつきを防ぐ
              const updated = data.map((item, idx) => ({
                ...item,
                order: String(idx + 1),
              }));
              setCategories(updated);

              // 2) 親に永続化を委譲（非同期）：失敗したらログ（必要ならロールバックを実装）
              const res = onReorder(updated, setCategories, type);
              if (res && typeof (res as Promise<void>).catch === "function") {
                (res as Promise<void>).catch((e) =>
                  console.error("カテゴリ並び替え保存エラー:", e)
                );
              }
            }}
            renderItem={({ item, drag, isActive }) => (
              <ScaleDecorator>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onLongPress={async () => {
                    await Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Medium
                    );
                    drag();
                  }}
                  // 🟩 通常タップで編集モーダル表示
                  onPress={() => handleCategoryPress(item)}
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
                  <Pressable
                    onPress={() => onDelete(item.id, setCategories, type)}
                    style={{ marginRight: 12, padding: 4 }}
                  >
                    <Ionicons name="remove-circle" size={22} color={c.error} />
                  </Pressable>

                  {/* アイコン */}
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={c.placeholder}
                    style={{ marginRight: 10 }}
                  />

                  {/* カテゴリ名 */}
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
          />

          {/* 追加ボタン */}
          <TouchableOpacity
            onPress={() => {
              setEditingCategory(null); // 🟩 新規モード
              setShowCategoryEditModal(true);
            }}
            style={[
              styles.fixedAddButton,
              {
                backgroundColor: c.secondary,
                borderTopColor: c.border,
                bottom: insets.bottom,
              },
            ]}
          >
            <Text style={{ color: c.text, fontSize: 16 }}>カテゴリー追加</Text>
          </TouchableOpacity>

          {/* 編集モーダル */}
          <CategoryEditModal
            visible={showCategoryEditModal}
            onClose={() => setShowCategoryEditModal(false)}
            onSave={(category) => {
              handleCategoryEditOnsave(
                categories,
                setCategories,
                category,
                type
              );
              setShowCategoryEditModal(false);
              setEditingCategory(null);
            }}
            // 🟩 編集時は初期値を渡す
            initialCategory={editingCategory ? editingCategory : undefined}
            type={type}
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
