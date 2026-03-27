// components/EditRegularIncomeModal.tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import RegularIncomeAndExpenseForm from "./RegularIncomeAndExpenseForm";
import { Category, RegularIncome, CycleRule } from "../types/models";

type Props = {
  visible: boolean;
  item: RegularIncome | null;
  categories: Category[];
  type: "income" | "expense";
  onClose: () => void;
  // 引数の型を CycleRule["type"] に合わせて厳密に定義
  onUpdate: (
    id: string,
    amount: number,
    memo: string,
    categoryId: string,
    cycleRule: CycleRule["type"],
  ) => void;
  // カテゴリー選択画面を開くためのハンドラー（親から受け継ぐ）
  onPressCategorySelect: () => void;
  // 現在選択中のカテゴリー（親で管理している場合）
  selectedCategory?: Category;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<Category | undefined>
  >;
};

export default function EditRegularIncomeModal({
  visible,
  item,
  categories,
  type,
  onClose,
  onUpdate,
  onPressCategorySelect,
  selectedCategory,
  setSelectedCategory,
}: Props) {
  // item が null の場合は何も表示しない（または空のModalを返す）
  if (!item) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose} // Androidの戻るボタン対応
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <RegularIncomeAndExpenseForm
            type={type}
            categories={categories}
            // 親から渡されたカテゴリー状態をそのままフォームへ
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onPressCategorySelect={onPressCategorySelect}
            // 編集対象のアイテムを渡す（フォーム内の useEffect で初期化される）
            itemToEdit={item}
            // 編集時の保存処理
            onUpdate={(id, amount, memo, catId, cycle) => {
              onUpdate(id, amount, memo, catId, cycle);
              onClose(); // 保存したら閉じる
            }}
            // フォームのインターフェース上必須なため定義（編集時は呼ばれない設計）
            onAdd={() => {}}
          />

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>キャンセル</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)", // 背景をしっかり暗く
    justifyContent: "center", // ★垂直方向の中央寄せ
    alignItems: "center", // ★水平方向の中央寄せ
  },
  absoluteBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: "100%", // ★ここが重要！画面幅の90%を使うように固定
    maxWidth: 500, // タブレットなどで広がりすぎないよう制限
    alignItems: "stretch", // 中のFormを横いっぱいに広げる
  },
  closeButton: {
    padding: 16,
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
