import { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export interface Category {
  id: string;
  order: string;
  name: string;
  icon: IconName;
}

export interface NewCategoryInput {
  name: string;
  icon: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string; // ISO文字列
  categoryId: string; // Categoryのidを参照
  memo?: string;
}
