// components/CategorySelector.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CategoryModal from "./CategoryModal";
import CategoryListModal from "./CategoryListModal";
import { Category, NewCategoryInput } from "../types/models";
import { colors } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";

//カテゴリーのincomeとexpenseの切り替え中！！

interface CategorySelectorProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  selectedCategoryId?: string;
  onSelect: (category: Category) => void;
  onReorder: (
    newList: Category[],
    setCategories: (value: React.SetStateAction<Category[]>) => void,
    type: "expense" | "income"
  ) => Promise<void>;
  onDelete: (
    id: string,
    setCategories: (value: React.SetStateAction<Category[]>) => void,
    type: "expense" | "income"
  ) => void;
  onEditSave: (
    categories: Category[],
    setCategories: (value: React.SetStateAction<Category[]>) => void,
    category: NewCategoryInput | Category,
    type: "expense" | "income"
  ) => Promise<void>;
  showCategoryModal: boolean;
  setShowCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  showCategoryListModal: boolean;
  setShowCategoryListModal: React.Dispatch<React.SetStateAction<boolean>>;
  type: "expense" | "income";
}

export default function CategorySelector({
  categories,
  setCategories,
  selectedCategoryId,
  onSelect,
  onReorder,
  onDelete,
  onEditSave,
  showCategoryModal,
  setShowCategoryModal,
  showCategoryListModal,
  setShowCategoryListModal,
  type,
}: CategorySelectorProps) {
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  return (
    <View>
      {/* モーダル群 */}
      <CategoryModal
        visible={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(category) => {
          onSelect(category);
          setShowCategoryModal(false);
        }}
        onEdit={() => {
          setShowCategoryModal(false);
          setShowCategoryListModal(true);
        }}
      />

      <CategoryListModal
        visible={showCategoryListModal}
        setCategories={setCategories}
        categories={categories}
        fileterdCategories={categories}
        onClose={() => setShowCategoryListModal(false)}
        onDelete={onDelete}
        onReorder={onReorder}
        showCategoryEditModal={showCategoryEditModal}
        setShowCategoryEditModal={setShowCategoryEditModal}
        handleCategoryEditOnsave={onEditSave}
        type={type}
      />
    </View>
  );
}
