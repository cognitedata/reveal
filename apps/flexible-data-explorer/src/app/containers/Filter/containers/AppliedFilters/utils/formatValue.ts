import isArray from 'lodash/isArray';

import { FieldType, ValueType } from '../../../types';

import { formatSingleValue } from './formatSingleValue';

export const formatValue = (value: ValueType, type: FieldType) => {
  if (isArray(value)) {
    return value.map((item) => formatSingleValue(item, type));
  }
  return formatSingleValue(value, type);
};
