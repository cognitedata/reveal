import isArray from 'lodash/isArray';
import isDate from 'lodash/isDate';
import isNumber from 'lodash/isNumber';

import {
  DateRange,
  FieldValue,
  NumericRange,
  ValueType,
} from '../types/filters';

export const isNumericRange = (value: ValueType): value is NumericRange => {
  return isArray(value) && isNumber(value[0]) && isNumber(value[1]);
};

export const isDateRange = (value: ValueType): value is DateRange => {
  return isArray(value) && isDate(value[0]) && isDate(value[1]);
};

export const convertDateRangeToNumericRange = (
  value: DateRange
): NumericRange => {
  return [value[0].valueOf(), value[1].valueOf()];
};

export const convertDateFieldToNumericField = (
  fieldValue?: FieldValue
): FieldValue | undefined => {
  if (!fieldValue) {
    return undefined;
  }

  const { value } = fieldValue;

  if (isNumber(value) || isNumericRange(value)) {
    return fieldValue;
  }

  if (isDate(value)) {
    return {
      ...fieldValue,
      value: value.valueOf(),
    };
  }

  if (isDateRange(value)) {
    return {
      ...fieldValue,
      value: convertDateRangeToNumericRange(value),
    };
  }

  return undefined;
};
