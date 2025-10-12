import { Category } from "../components/CategoryModal";

export const APP_NAME = "LibreMoney";
export const DEFAULT_CURRENCY = "JPY";

export const STORAGE_KEYS = {
  EXPENSES: "expenses",
  EXPENSES_COUNTER: "expenses_next_id",
  CATEGORIES: "categories",
  CATEGORIES_COUNTER: "categories_next_id",
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "食費", icon: "fast-food-outline" },
  { id: "2", name: "交通", icon: "bus-outline" },
  { id: "3", name: "日用品", icon: "cart-outline" },
  { id: "4", name: "光熱費", icon: "flash-outline" },
  { id: "5", name: "娯楽", icon: "game-controller-outline" },
  { id: "6", name: "その他", icon: "ellipsis-horizontal-outline" },
];

export const CALC_BUTTONS = [
  ["⌫", "AC", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

export const DISPLAY_CONFIRM_BTN = "登録";

export const NAV_ROUTES = {
  CATEGORY_EDIT: "CategoryEdit",
};
