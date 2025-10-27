import { Category } from "../types/models";

export const getCategory = (categories: Category[], categoryId: string) => {
  const category = categories.find((cat) => cat.id === categoryId);

  return category || undefined;
};
