import { FieldValue } from '../../../types';

export const getInitialOperator = <TOperator extends string>(
  operators: TOperator[],
  fieldValue?: FieldValue
): TOperator => {
  if (!fieldValue?.operator) {
    return operators[0];
  }

  const { operator } = fieldValue;

  if (operators.includes(operator as TOperator)) {
    return operator as TOperator;
  }

  return operators[0];
};
