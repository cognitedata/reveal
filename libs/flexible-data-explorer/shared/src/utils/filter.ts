import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';

import {
  DateRange,
  FieldValue,
  NumericRange,
  ValueType,
} from '../types/filters';

import { isDate } from './date';

export const isNumericRange = (value: ValueType): value is NumericRange => {
  return isArray(value) && isNumber(value[0]) && isNumber(value[1]);
};

export const isDateRange = (value: ValueType): value is DateRange => {
  return isArray(value) && isDate(value[0]) && isDate(value[1]);
};

export const convertDateRangeToNumericRange = (
  value: DateRange
): NumericRange => {
  return [new Date(value[0]).valueOf(), new Date(value[1]).valueOf()];
};

export const convertDateFieldToNumericField = (
  fieldValue?: FieldValue
): FieldValue | undefined => {
  if (!fieldValue) {
    return undefined;
  }

  const { value, type } = fieldValue;

  if (type === 'number' && (isNumber(value) || isNumericRange(value))) {
    return fieldValue;
  }

  if (type === 'date') {
    if (isDate(value)) {
      return {
        ...fieldValue,
        value: new Date(value).valueOf(),
      };
    }

    if (isDateRange(value)) {
      return {
        ...fieldValue,
        value: convertDateRangeToNumericRange(value),
      };
    }
  }

  return undefined;
};
