import Fraction from 'fraction.js';

/**
 * Converts a number with decimals to a fraction.
 *
 * toFraction(1.5) => 1 1/2
 * toFraction(1.25) => 1 1/4
 * toFraction(1.625) => 1 5/8
 */
export const toFraction = (value: number | string) => {
  return new Fraction(value).toFraction(true);
};
