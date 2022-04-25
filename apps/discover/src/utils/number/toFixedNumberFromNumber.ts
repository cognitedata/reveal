export const toFixedNumberFromNumber = (
  value: number,
  decimalPlaces = 3
): number => {
  return Number(value.toFixed(decimalPlaces));
};
