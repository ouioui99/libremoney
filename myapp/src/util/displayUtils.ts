import { Category, Expense, RegularIncome } from "../types/models";
import { getElapsedDaysFromToday } from "./dateUtils";

export const getCategory = (categories: Category[], categoryId: string) => {
  const category = categories.find((cat) => cat.id === categoryId);

  return category || undefined;
};

export const calculateUsableAmountParDay = (
  targetAmount: number,
  regularExpenses: RegularIncome[],
  regularIncomes: RegularIncome[],
  remainingDays: number
): number => {
  if (remainingDays <= 0) return 0;

  // 残り期間中の総収入
  const totalIncome = regularIncomes.reduce(
    (sum, income) => sum + calculateTotalForPeriod(income, remainingDays),
    0
  );

  // 残り期間中の総支出
  const totalExpense = regularExpenses.reduce(
    (sum, expense) => sum + calculateTotalForPeriod(expense, remainingDays),
    0
  );

  // 目標額を貯めるために1日あたり使える金額を計算
  const usableAmountPerDay =
    (totalIncome - totalExpense - targetAmount) / remainingDays;

  // マイナスになった場合は0円扱い
  return Math.max(0, Math.floor(usableAmountPerDay));
};

/**
 * 指定された定期入出金が残り期間中に何回発生するかをもとに合計金額を算出
 */
const calculateTotalForPeriod = (
  item: RegularIncome,
  remainingDays: number
): number => {
  const daysPerCycle =
    item.cycleRule.type === "weekly"
      ? 7
      : item.cycleRule.type === "monthly"
      ? 30
      : 365;

  const cycles = Math.floor(remainingDays / daysPerCycle);
  return item.amount * cycles;
};

export const calculateTodayUsableAmount = (
  usableAmountPerDay: number,
  expenses: Expense[],
  incomes: Expense[],
  savingsGoalStartedAt: string
) => {
  const elapsedDaysFromToday = getElapsedDaysFromToday(savingsGoalStartedAt);

  const totalAllUsableAmount = usableAmountPerDay * elapsedDaysFromToday;

  const sumExpensesAfterStarted = sumExpensesAfterDate(
    expenses,
    savingsGoalStartedAt
  );
  const sumIncomesAfterStarted = sumExpensesAfterDate(
    incomes,
    savingsGoalStartedAt
  );

  const resultAmount =
    totalAllUsableAmount + sumIncomesAfterStarted - sumExpensesAfterStarted;

  return resultAmount;
};

/**
 * 指定日より後の日付の支出を合計する関数
 * @param expenses Expense配列
 * @param date ISO文字列 または Dateオブジェクト
 * @returns number 合計金額
 */
export const sumExpensesAfterDate = (
  expenses: Expense[],
  date: string | Date
): number => {
  const targetDate = new Date(date);

  return expenses
    .filter((expense) => new Date(expense.date) > targetDate)
    .reduce((total, expense) => total + expense.amount, 0);
};
