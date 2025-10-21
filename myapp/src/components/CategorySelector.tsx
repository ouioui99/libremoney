// components/CategorySelector.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CategoryModal from "./CategoryModal";
import CategoryListModal from "./CategoryListModal";
import { Category, NewCategoryInput } from "../types/models";
import { colors } from "../theme/colors";
import { useTheme } from "../contexts/ThemeContext";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSelect: (categoryId: string) => void;
  onReorder: (newList: Category[]) => void;
  onDelete: (id: string) => void;
  onEditSave: (category: NewCategoryInput | Category) => void;
  showCategoryModal: boolean;
  setShowCategoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  showCategoryListModal: boolean;
  setShowCategoryListModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
  onReorder,
  onDelete,
  onEditSave,
  showCategoryModal,
  setShowCategoryModal,
  showCategoryListModal,
  setShowCategoryListModal,
}: CategorySelectorProps) {
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);

  const { theme } = useTheme();
  const c = colors[theme];

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <View>
      {/* モーダル群 */}
      <CategoryModal
        visible={showCategoryModal}
        categories={categories}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(categoryId) => {
          onSelect(categoryId);
          setShowCategoryModal(false);
        }}
        onEdit={() => {
          setShowCategoryModal(false);
          setShowCategoryListModal(true);
        }}
      />

      <CategoryListModal
        visible={showCategoryListModal}
        categories={categories}
        onClose={() => setShowCategoryListModal(false)}
        onDelete={onDelete}
        onReorder={onReorder}
        showCategoryEditModal={showCategoryEditModal}
        setShowCategoryEditModal={setShowCategoryEditModal}
        handleCategoryEditOnsave={onEditSave}
      />
    </View>
  );
}
