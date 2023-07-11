import { FieldType, InputType, Operator } from '../../types';

export const INPUT_TYPE_CONFIG: Record<
  Operator,
  InputType | Partial<Record<FieldType, InputType>>
> = {
  [Operator.STARTS_WITH]: 'string',
  [Operator.NOT_STARTS_WITH]: 'string',
  [Operator.CONTAINS]: {
    string: 'string',
    number: 'number',
  },
  [Operator.NOT_CONTAINS]: {
    string: 'string',
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

const EXISTANCE_OPERATORS = [Operator.IS_SET, Operator.IS_NOT_SET];

export const DEFAULT_OPERATORS: Record<FieldType, Operator[]> = {
  string: [
    Operator.STARTS_WITH,
    Operator.NOT_STARTS_WITH,
    Operator.CONTAINS,
    Operator.NOT_CONTAINS,
    ...EXISTANCE_OPERATORS,
  ],
  number: [
    Operator.BETWEEN,
    Operator.NOT_BETWEEN,
    Operator.GREATER_THAN,
    Operator.LESS_THAN,
    Operator.EQUALS,
    Operator.NOT_EQUALS,
    ...EXISTANCE_OPERATORS,
  ],
  date: [
    Operator.BEFORE,
    Operator.NOT_BEFORE,
    Operator.BETWEEN,
    Operator.NOT_BETWEEN,
    Operator.AFTER,
    Operator.NOT_AFTER,
    Operator.ON,
    Operator.NOT_ON,
    ...EXISTANCE_OPERATORS,
  ],
  boolean: [Operator.IS_TRUE, Operator.IS_FALSE, ...EXISTANCE_OPERATORS],
};
