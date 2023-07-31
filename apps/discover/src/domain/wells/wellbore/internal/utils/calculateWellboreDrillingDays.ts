import isNil from 'lodash/isNil';
import { Fixed, toFixedNumberFromNumber } from 'utils/number';

export const calculateWellboreDrillingDays = (
  currentWellboreTotalDrillingDays?: number,
  parentWellboreTotalDrillingDays = 0
) => {
  if (isNil(currentWellboreTotalDrillingDays)) {
    return undefined;
  }

  return toFixedNumberFromNumber(
    currentWellboreTotalDrillingDays - parentWellboreTotalDrillingDays,
    Fixed.TwoDecimals
  );
};
