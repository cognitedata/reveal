import { toFraction } from './toFraction';

/**
 * Formats the value into the readable form of inches.
 *
 * 10.375 -> 10-3/8"
 * 10.38  -> 10-3/8"
 */
export const toReadableInches = (value: number) => {
  const rounded = Math.round(value * 8) / 8;
  const fraction = toFraction(rounded);

  return `${fraction.replace(/\s+/g, '-')}"`;
};
