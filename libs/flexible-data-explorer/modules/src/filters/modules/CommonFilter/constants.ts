import { FieldType, Operator } from '@fdx/shared/types/filters';

const EXISTANCE_OPERATORS = [Operator.IS_SET, Operator.IS_NOT_SET];

export const DEFAULT_OPERATORS: Record<FieldType, Operator[]> = {
  string: [
    Operator.STARTS_WITH,
    Operator.NOT_STARTS_WITH,
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
