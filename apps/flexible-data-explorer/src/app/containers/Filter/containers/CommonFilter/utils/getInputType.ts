import { FieldType, InputType, Operator } from '../../../types';
import { INPUT_TYPE_CONFIG } from '../constants';

export const getInputType = (
  fieldType: FieldType,
  operator: Operator
): InputType => {
  const inputType = INPUT_TYPE_CONFIG[operator];

  if (inputType instanceof Object) {
    return inputType[fieldType] || 'no-input';
  }

  return inputType;
};
