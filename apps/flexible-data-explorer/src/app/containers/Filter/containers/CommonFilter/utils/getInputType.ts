import { FieldType, InputType, Operator } from '../../../types';

const INPUT_TYPE_CONFIG: Record<
  Operator,
  InputType | Partial<Record<FieldType, InputType>>
> = {
  [Operator.STARTS_WITH]: 'string',
  [Operator.NOT_STARTS_WITH]: 'string',
  [Operator.CONTAINS]: {
    number: 'number',
  },
  [Operator.NOT_CONTAINS]: {
    number: 'number',
  },
  [Operator.BETWEEN]: {
    number: 'numeric-range',
    date: 'date-range',
  },
  [Operator.NOT_BETWEEN]: {
    number: 'numeric-range',
    date: 'date-range',
  },
  [Operator.GREATER_THAN]: 'number',
  [Operator.LESS_THAN]: 'number',
  [Operator.EQUALS]: {
    string: 'string',
    number: 'number',
  },
  [Operator.NOT_EQUALS]: {
    string: 'string',
    number: 'number',
  },
  [Operator.BEFORE]: 'date',
  [Operator.NOT_BEFORE]: 'date',
  [Operator.AFTER]: 'date',
  [Operator.NOT_AFTER]: 'date',
  [Operator.ON]: 'date',
  [Operator.NOT_ON]: 'date',
  [Operator.IS_TRUE]: 'no-input',
  [Operator.IS_FALSE]: 'no-input',
  [Operator.IS_SET]: 'no-input',
  [Operator.IS_NOT_SET]: 'no-input',
};

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
