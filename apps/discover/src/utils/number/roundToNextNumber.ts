/**
 * Rounds the value to the next number.
 */
export const roundToNextNumber = (value: number, roundTo: number) => {
  const roundedValue = Math.ceil(Math.abs(value) / roundTo) * roundTo;

  if (value < 0) {
    return roundedValue * -1;
  }

  return roundedValue;
};
