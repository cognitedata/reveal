export const getPercent = (value: number, total: number): number => {
  if (!value || !total) {
    return 0;
  }

  const result = (value / total) * 100;

  return Number(result.toFixed(0));
};
