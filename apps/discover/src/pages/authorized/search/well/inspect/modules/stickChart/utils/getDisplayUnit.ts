export const getDisplayUnit = (unit?: string) => {
  if (!unit) {
    return '';
  }
  return `(${unit})`;
};
