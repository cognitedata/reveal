import { FieldValue } from '@fdx/shared/types/filters';
import isObject from 'lodash/isObject';

export const isFieldValue = (value: object): value is FieldValue => {
  if ('operator' in value && !isObject(value.operator)) {
    return true;
  }
  return false;
};
