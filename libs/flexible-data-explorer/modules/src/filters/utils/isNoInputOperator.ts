import { Operator } from '@fdx/shared/types/filters';

type NoInputOperator =
  | Operator.IS_SET
  | Operator.IS_NOT_SET
  | Operator.IS_TRUE
  | Operator.IS_FALSE;

const NO_INPUT_OPERATORS = [
  Operator.IS_SET,
  Operator.IS_NOT_SET,
  Operator.IS_TRUE,
  Operator.IS_FALSE,
];

export const isNoInputOperator = (
  operator: Operator
): operator is NoInputOperator => {
  return NO_INPUT_OPERATORS.includes(operator);
};
