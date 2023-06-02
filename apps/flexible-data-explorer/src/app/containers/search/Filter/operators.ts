export enum Operator {
  STARTS_WITH = 'Starts with',
  NOT_STARTS_WITH = 'Does not start with',
  CONTAINS = 'Contains',
  NOT_CONTAINS = 'Does not contain',
  BETWEEN = 'Is between',
  NOT_BETWEEN = 'Is not between',
  GREATER_THAN = 'Is greater than',
  LESS_THAN = 'Is less than',
  EQUALS = 'Is equal to',
  NOT_EQUALS = 'Is not equal to',
  BEFORE = 'Is before',
  NOT_BEFORE = 'Is not before',
  AFTER = 'Is after',
  NOT_AFTER = 'Is not after',
  ON = 'Is on',
  NOT_ON = 'Is not on',
  IS_TRUE = 'Is true',
  IS_FALSE = 'Is false',
  IS_SET = 'Is set',
  IS_NOT_SET = 'Is not set',
}

export type StringOperator =
  | Operator.STARTS_WITH
  | Operator.NOT_STARTS_WITH
  | Operator.CONTAINS
  | Operator.NOT_CONTAINS
  | Operator.IS_SET
  | Operator.IS_NOT_SET;

export type NumberOperator =
  | Operator.BETWEEN
  | Operator.NOT_BETWEEN
  | Operator.GREATER_THAN
  | Operator.LESS_THAN
  | Operator.EQUALS
  | Operator.NOT_EQUALS
  | Operator.IS_SET
  | Operator.IS_NOT_SET;

export type DateOperator =
  | Operator.BEFORE
  | Operator.NOT_BEFORE
  | Operator.BETWEEN
  | Operator.NOT_BETWEEN
  | Operator.AFTER
  | Operator.NOT_AFTER
  | Operator.ON
  | Operator.NOT_ON
  | Operator.IS_SET
  | Operator.IS_NOT_SET;

export type BooleanOperator =
  | Operator.IS_TRUE
  | Operator.IS_FALSE
  | Operator.IS_SET
  | Operator.IS_NOT_SET;
