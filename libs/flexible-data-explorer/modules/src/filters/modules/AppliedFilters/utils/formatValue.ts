import { FieldType, ValueType } from '@fdx/shared/types/filters';
import isArray from 'lodash/isArray';

import { formatSingleValue } from './formatSingleValue';

export const formatValue = (value: ValueType, type: FieldType) => {
  if (isArray(value)) {
    return value.map((item) => formatSingleValue(item, type));
  }
  return formatSingleValue(value, type);
};
