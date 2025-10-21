import AsyncStorage from "@react-native-async-storage/async-storage";
import { Category, NewCategoryInput } from "../types/models";
import { STORAGE_KEYS } from "./constant";
import { Alert } from "react-native";
import {
  addItemToStorage,
  editItemInStorage,
  getNextId,
  removeItemFromStorage,
} from "./storageUtils";
import { Ionicons } from "@expo/vector-icons";

// 型ガード関数
const isCategory = (v: NewCategoryInput | Category): v is Category => {
  return (v as Category).id !== undefined && (v as Category).id !== "";
};

// 並び替えを親で受けて保存
export const handleCategoryReorder = async (
  newList: Category[],
  setCategories: (value: React.SetStateAction<Category[]>) => void
) => {
  try {
    // 各要素に order を振り直す（1始まり）
    const updated = newList.map((cat, idx) => ({
      ...cat,
      order: String(idx + 1),
    }));
    await AsyncStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(updated)
    );
    setCategories(updated);
  } catch (e) {
    console.error("カテゴリ並び替え保存エラー:", e);
  }
};

// 親で削除を処理（ストレージと state を更新）
export const handleCategoryDelete = (
  id: string,
  setCategories: (value: React.SetStateAction<Category[]>) => void
) => {
  Alert.alert(
    "確認",
    "このカテゴリを削除しますか？",
    [
      {
        text: "キャンセル",
        style: "cancel",
      },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            const updated = await removeItemFromStorage<Category>(
              STORAGE_KEYS.CATEGORIES,
              (item) => item.id === id
            );
            setCategories(updated);
          } catch (e) {
            console.error("カテゴリ削除エラー:", e);
          }
        },
      },
    ],
    { cancelable: true }
  );
};

export const handleCategoryEditOnSave = async (
  categories: Category[],
  setCategories: (value: React.SetStateAction<Category[]>) => void,
  category: NewCategoryInput | Category
) => {
  // 編集 or 追加を判定して保存処理
  // category が Category 型なら編集、NewCategoryInput 型なら新規追加
  if (isCategory(category)) {
    // 編集
    try {
      const id = category.id;

      const newCategory = {
        id: id,
        name: category.name,
        icon: category.icon as keyof typeof Ionicons.glyphMap,
        order: category.order,
      };

      const updatedCategories = await editItemInStorage<Category>(
        STORAGE_KEYS.CATEGORIES,
        (item) => item.id === id,
        categories,
        newCategory as unknown as Category
      );

      setCategories(updatedCategories);
    } catch (e) {
      console.error("カテゴリ編集保存エラー:", e);
    }
    return;
  } else {
    // 新規追加
    const newId = await getNextId(STORAGE_KEYS.CATEGORIES);

    const newCategory = {
      id: newId,
      // 末尾に追加するので現在の件数＋1 を order にする
      order: String((categories?.length ?? 0) + 1),
      icon: category.icon as keyof typeof Ionicons.glyphMap,
      name: category.name,
    };

    const newCategories = await addItemToStorage(
      STORAGE_KEYS.CATEGORIES,
      categories,
      newCategory
    );

    setCategories(newCategories);
  }
};
