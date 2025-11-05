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
  type: "expense" | "income";
}

export interface Expense {
  id: string;
  amount: number;
  date: string; // ISO文字列
  categoryId: string; // Categoryのidを参照
  memo?: string;
}

export interface SavingsGoal {
  amount: number;
  deadline: string;
  createdAt: string;
}

export interface RegularIncome {
  id: string;
  amount: number;
  memo: string;
  categoryId: string;
  cycleRule: CycleRule;
}

export interface CycleRule {
  type: "weekly" | "monthly" | "yearly";
  detail?: {
    dayOfWeek?: number;
    dayOfMonth?: number;
    month?: number;
  };
}
