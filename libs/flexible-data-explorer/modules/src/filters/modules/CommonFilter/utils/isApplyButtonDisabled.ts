import { InputType, ValueType } from '@fdx/shared/types/filters';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';

export const isApplyButtonDisabled = (
  inputType: InputType,
  value?: ValueType
) => {
  if (inputType === 'boolean' || inputType === 'no-input') {
    return false;
  }

  if (inputType === 'string') {
    return isEmpty(value);
  }

  return isNil(value);
};
