export const isNumber = (value: number) => !Number.isNaN(value);

export const isNumeric = (value: string) => {
  return /^-?\d+$/.test(value);
};
