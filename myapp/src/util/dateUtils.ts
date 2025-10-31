export const getTodayLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const calculateRemainingDays = (deadline: string): number => {
  const today = new Date(getTodayLocal());
  const targetDate = new Date(deadline);

  // 時間差（ミリ秒）を計算
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 小数切り上げ

  return diffDays !== null ? diffDays : 0;
};

export const calculateTotalDays = (
  deadline: string,
  createdAt: string
): number => {
  const createdAtDate = new Date(createdAt);
  const targetDate = new Date(deadline);

  // 時間差（ミリ秒）を計算
  const diffTime = targetDate.getTime() - createdAtDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 小数切り上げ

  return diffDays !== null ? diffDays : 0;
};
