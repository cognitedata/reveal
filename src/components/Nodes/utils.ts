import { Operation } from '@cognite/calculation-backend';

export const getCategoriesFromToolFunctions = (
  availableOperations: Operation[]
) => {
  const categories: { [key: string]: Operation[] } = {};

  availableOperations.forEach((func) => {
    if (Array.isArray(func.category)) {
      func.category.forEach((category) => {
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(func);
      });
    } else {
      if (!categories[func.category]) {
        categories[func.category] = [];
      }
      categories[func.category].push(func);
    }
  });

  return categories;
};
