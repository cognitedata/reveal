import isNaN from 'lodash/isNaN';
import { convertToUpperCase } from 'utils/convertToUpperCase';

export const sortByCaseInsensitive = (
  firstValue: string | number,
  secondValue: string | number,
  reverse = false
) => {
  const order = reverse ? -1 : 1;

  if (isNaN(Number(firstValue))) {
    return convertToUpperCase(firstValue) > convertToUpperCase(secondValue)
      ? order
      : -order;
  }

  return Number(firstValue) > Number(secondValue) ? order : -order;
};
