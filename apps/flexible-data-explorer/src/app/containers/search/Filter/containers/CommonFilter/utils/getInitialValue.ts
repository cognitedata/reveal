import isUndefined from 'lodash/isUndefined';

import { Operator, FieldValue, ValueType } from '../../../types';

export const getInitialValue = (
  operators: Operator[],
  fieldValue?: FieldValue
): ValueType | undefined => {
  if (!fieldValue || isUndefined(fieldValue?.value)) {
    return undefined;
  }

  const { operator, value } = fieldValue;

  if (operators.includes(operator)) {
    return value;
  }

  return undefined;
};
