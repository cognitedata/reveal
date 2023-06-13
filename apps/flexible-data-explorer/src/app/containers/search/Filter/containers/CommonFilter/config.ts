import { FieldType, InputType, Operator } from '../../types';

export const CONFIG: Record<FieldType, Partial<Record<Operator, InputType>>> = {
  string: {
    [Operator.STARTS_WITH]: 'string',
    [Operator.NOT_STARTS_WITH]: 'string',
    [Operator.CONTAINS]: 'string',
    [Operator.NOT_CONTAINS]: 'string',
    [Operator.IS_SET]: 'no-input',
    [Operator.IS_NOT_SET]: 'no-input',
  },
  number: {
    [Operator.BETWEEN]: 'numeric-range',
    [Operator.NOT_BETWEEN]: 'numeric-range',
    [Operator.GREATER_THAN]: 'number',
    [Operator.LESS_THAN]: 'number',
    [Operator.EQUALS]: 'number',
    [Operator.NOT_EQUALS]: 'number',
    [Operator.IS_SET]: 'no-input',
    [Operator.IS_NOT_SET]: 'no-input',
  },
  boolean: {
    [Operator.IS_TRUE]: 'boolean',
    [Operator.IS_FALSE]: 'boolean',
    [Operator.IS_SET]: 'no-input',
    [Operator.IS_NOT_SET]: 'no-input',
  },
  date: {
    [Operator.BEFORE]: 'date',
    [Operator.NOT_BEFORE]: 'date',
    [Operator.BETWEEN]: 'date-range',
    [Operator.NOT_BETWEEN]: 'date-range',
    [Operator.AFTER]: 'date',
    [Operator.NOT_AFTER]: 'date',
    [Operator.ON]: 'date',
    [Operator.NOT_ON]: 'date',
    [Operator.IS_SET]: 'no-input',
    [Operator.IS_NOT_SET]: 'no-input',
  },
};
