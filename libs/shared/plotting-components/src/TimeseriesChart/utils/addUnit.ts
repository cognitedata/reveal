export const addUnit = <T extends string | number>(value: T, unit?: string) => {
  if (unit) {
    return `${value} (${unit})`;
  }

  return value;
};
