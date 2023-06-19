import { FieldValue, Operator } from '../../../types';

export const getInitialOperator = (
  operators: Operator[],
  fieldValue?: FieldValue
): Operator => {
  return fieldValue?.operator || operators[0];
};
