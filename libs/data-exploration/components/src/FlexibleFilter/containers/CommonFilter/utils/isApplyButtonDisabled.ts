import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { InputType, ValueType } from '../../../types';

export const isApplyButtonDisabled = <T extends InputType>(
  inputType: T,
  value: ValueType<T>
) => {
  if (inputType === 'boolean' || inputType === 'no-input') {
    return false;
  }

  if (inputType === 'string') {
    return isEmpty(value);
  }

  return isUndefined(value);
};
