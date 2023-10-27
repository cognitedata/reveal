import { FieldValue, Operator } from '@fdx/shared/types/filters';

export const getInitialOperator = (
  operators: Operator[],
  fieldValue?: FieldValue
): Operator => {
  return fieldValue?.operator || operators[0];
};
