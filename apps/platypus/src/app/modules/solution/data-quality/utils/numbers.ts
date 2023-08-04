import { toNumber } from 'lodash';

/** Abbreviate a number to display it in a smaller string.
 * The abbreviated numbers will be shortened and appended with 'K', 'M', 'B', or 'T', depending on the size of the number.
 *
 * e.g. 10,000,000 will be abbreviated to 10M */
export const abbreviateNumber = (input: number | string) => {
  const n = Math.abs(toNumber(input));

  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return `${+(n / 1e3).toFixed(1)}K`;
  if (n >= 1e6 && n < 1e9) return `${+(n / 1e6).toFixed(1)}M`;
  if (n >= 1e9 && n < 1e12) return `${+(n / 1e9).toFixed(1)}B`;
  if (n >= 1e12) return `${+(n / 1e12).toFixed(1)}T`;

  return n;
};
