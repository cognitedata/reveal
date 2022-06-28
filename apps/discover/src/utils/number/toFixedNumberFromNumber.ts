import { Fixed } from './constants';

export const toFixedNumberFromNumber = (
  value: number,
  decimalPlaces = Fixed.ThreeDecimals
): number => {
  return Number(Number(value).toFixed(decimalPlaces));
};
