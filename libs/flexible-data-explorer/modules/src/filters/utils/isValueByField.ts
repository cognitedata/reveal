import {
  FieldValue,
  ValueByDataType,
  ValueByField,
} from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';

import { isFieldValue } from './isFieldValue';

export const isValueByField = (
  object: ValueByDataType | ValueByField
): object is ValueByField => {
  if (isEmpty(object)) {
    return true;
  }

  const value: ValueByField | FieldValue = Object.values(object)[0];

  if (isFieldValue(value)) {
    return true;
  }

  return false;
};
