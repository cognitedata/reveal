import isUndefined from 'lodash/isUndefined';

import { BaseConfig, FieldValue, ValueType } from '../../../types';

export const getInitialValue = <
  TOperator extends string,
  TConfig extends BaseConfig
>(
  operators: TOperator[],
  fieldValue?: FieldValue
): ValueType<TConfig[TOperator]> | undefined => {
  if (!fieldValue || isUndefined(fieldValue?.value)) {
    return undefined;
  }

  const { operator, value } = fieldValue;

  if (operators.includes(operator as TOperator)) {
    return value as ValueType<TConfig[TOperator]>;
  }

  return undefined;
};
