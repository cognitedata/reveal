import * as React from 'react';
import { useMemo } from 'react';

import {
  Field,
  Operator,
  ValueType,
  InputType,
  FieldValue,
  OperatorConfig,
  FieldType,
  StringOperator,
  BooleanOperator,
  DateOperator,
  NumberOperator,
} from '../../types';

import { getFilterByFieldType } from './utils';

type OperatorType =
  | (StringOperator[] & NumberOperator[] & BooleanOperator[] & DateOperator[])
  | undefined;

export interface FilterByFieldProps {
  field: Field;
  value?: FieldValue;
  operators?: OperatorConfig[FieldType];
  onBackClick: () => void;
  onApplyClick: (operator: Operator, value: ValueType<InputType>) => void;
}

export const FilterByField: React.FC<FilterByFieldProps> = ({
  field,
  value,
  operators,
  onBackClick,
  onApplyClick,
}) => {
  const Filter = useMemo(() => {
    return getFilterByFieldType(field.type);
  }, [field.type]);

  return (
    <Filter
      name={field.name}
      value={value}
      operators={operators as OperatorType}
      onBackClick={onBackClick}
      onApplyClick={onApplyClick}
    />
  );
};
