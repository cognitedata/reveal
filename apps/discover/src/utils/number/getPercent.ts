export const getPercent = (value: number, total: number): number => {
  if (!value || !total) {
    return 0;
  }

  return (value / total) * 100;
};

export const getFixedPercent = (
  value: number,
  total: number,
  fractionDigits = 0
): number => {
  const result = getPercent(value, total);

  return Number(result.toFixed(fractionDigits));
};
