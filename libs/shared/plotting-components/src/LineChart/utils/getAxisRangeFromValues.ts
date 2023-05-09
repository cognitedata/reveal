import isUndefined from 'lodash/isUndefined';

import { AxisRange, ValueType } from '../types';
import { getValueTypeAsNumber } from './getValueTypeAsNumber';

export const getAxisRangeFromValues = (
  min?: ValueType,
  max?: ValueType
): AxisRange | undefined => {
  if (isUndefined(min) || isUndefined(max)) {
    return undefined;
  }

  return [
    getValueTypeAsNumber(min, String(min)),
    getValueTypeAsNumber(max, String(max)),
  ];
};
