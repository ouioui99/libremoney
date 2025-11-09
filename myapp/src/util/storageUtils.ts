import { boolean } from "./../../node_modules/zod/src/v4/core/regexes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./constants";

/**
 * 任意のキーの配列データに新しい要素を追加して保存する
 * @param key AsyncStorageのキー名 (例: "expenses")
 * @param newItem 追加する新しい要素
 * @returns 更新後の配列
 */
export const addItemToStorage = async <T>(
  key: string,
  items: T[],
  newItem: T
): Promise<T[]> => {
  try {
    // 新しい要素を追加
    const updatedItems = [...items, newItem];

    // 保存
    await AsyncStorage.setItem(key, JSON.stringify(updatedItems));

    console.log(`✅ Added new item to "${key}":`, newItem);
    return updatedItems;
  } catch (error) {
    console.error(`❌ Failed to add item to "${key}":`, error);
    throw error;
  }
};

export const getItemsFromStorage = async <T>(key: string): Promise<T[]> => {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const removeItemFromStorage = async <T>(
  key: string,
  predicate: (item: T) => boolean
): Promise<T[]> => {
  const data = await AsyncStorage.getItem(key);
  const items: T[] = data ? JSON.parse(data) : [];
  const updatedItems = items.filter((item) => !predicate(item));
  await AsyncStorage.setItem(key, JSON.stringify(updatedItems));
  return updatedItems;
};

/**
 * 条件に一致するアイテムを更新
 * matchFn(item) が true のものを newItem で置き換えます
 */
export const editItemInStorage = async <T>(
  key: string,
  matchFn: (item: T) => boolean,
  newItem: T
): Promise<T[]> => {
  // 最新のデータを取得
  const items = await getItemsFromStorage<T>(key);

  const updatedItems = items.map((item) => (matchFn(item) ? newItem : item));

  await AsyncStorage.setItem(key, JSON.stringify(updatedItems));
  return updatedItems;
};

/**
 * 汎用：次の連番IDを取得してカウンターをインクリメントする
 * - itemsKey: アイテム配列を保存している AsyncStorage のキー (例: "expenses")
 * - counterKey: カウンター用キー（省略時は `${itemsKey}_next_id`）
 * 返り値は文字列 ("1","2",...)
 */
export async function getNextId(
  itemsKey: string,
  counterKey?: string
): Promise<string> {
  const cntKey = counterKey ?? `${itemsKey}_next_id`;

  const counterRaw = await AsyncStorage.getItem(cntKey);
  if (counterRaw) {
    const next = Number(counterRaw) + 1;
    await AsyncStorage.setItem(cntKey, String(next));
    return String(next);
  }

  // カウンター未設定なら既存のデータから最大IDを計算して初期化（安全策）
  const raw = await AsyncStorage.getItem(itemsKey);
  if (raw) {
    try {
      const list = JSON.parse(raw) as { id?: string }[];
      const max = list.reduce((m, e) => Math.max(m, Number(e.id ?? 0) || 0), 0);
      const next = max + 1;
      await AsyncStorage.setItem(cntKey, String(next));
      return String(next);
    } catch {
      // パース失敗はフォールバック
    }
  }

  // デフォルトは 1
  await AsyncStorage.setItem(cntKey, "1");
  return "1";
}

/**
 * 互換ラッパー: expenses 用の次のIDを取得
 */
export async function getNextExpenseId(): Promise<string> {
  const itemsKey = STORAGE_KEYS?.EXPENSES ?? "expenses";
  const counterKey = STORAGE_KEYS?.EXPENSES_COUNTER ?? `${itemsKey}_next_id`;
  return getNextId(itemsKey, counterKey);
}

/**
 * 互換ラッパー: expenses 用の次のIDを取得
 */
export async function getNextCategoryId(isInomeMode: boolean): Promise<string> {
  let itemsKey: string;
  let counterKey: string;
  if (isInomeMode) {
    itemsKey = STORAGE_KEYS?.INCOMES ?? "incomes";
    counterKey = STORAGE_KEYS?.INCOMES_COUNTER ?? `${itemsKey}_next_id`;
  } else {
    itemsKey = STORAGE_KEYS?.EXPENSES ?? "expenses";
    counterKey = STORAGE_KEYS?.EXPENSES_COUNTER ?? `${itemsKey}_next_id`;
  }

  return getNextId(itemsKey, counterKey);
}
