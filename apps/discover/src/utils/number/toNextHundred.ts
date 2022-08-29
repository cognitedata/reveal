/**
 * Rounds the value to the next hundred.
 */
export const toNextHundred = (value: number) => {
  return Math.ceil(value / 100) * 100;
};
