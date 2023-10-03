import isObject from 'lodash/isObject';

import { FieldValue } from '../types';

export const isFieldValue = (value: object): value is FieldValue => {
  if ('operator' in value && !isObject(value.operator)) {
    return true;
  }
  return false;
};
