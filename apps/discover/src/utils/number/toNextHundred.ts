/**
 * Rounds the value to the next hundred.
 */
export const toNextHundred = (value: number) => {
  const roundedValue = Math.ceil(Math.abs(value) / 100) * 100;

  if (value < 0) {
    return roundedValue * -1;
  }

  return roundedValue;
};
