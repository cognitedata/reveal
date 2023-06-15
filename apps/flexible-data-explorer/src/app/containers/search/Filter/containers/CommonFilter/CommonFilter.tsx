import * as React from 'react';
import { useMemo, useState } from 'react';

import { ApplyButton, Menu, MenuHeader, Select } from '../../components';
import { Field, FieldValue, Operator, ValueType } from '../../types';

import { CommonFilterInput } from './CommonFilterInput';
import {
  getInitialOperator,
  getInputType,
  getOperators,
  isApplyButtonDisabled,
} from './utils';

export interface CommonFilterProps {
  field: Field;
  value?: FieldValue;
  onBackClick: () => void;
  onApplyClick: (operator: Operator, value: ValueType) => void;
}

export const CommonFilter: React.FC<CommonFilterProps> = ({
  field,
  value: fieldValue,
  onBackClick,
  onApplyClick,
}) => {
  const operators = useMemo(() => {
    return getOperators(field);
  }, [field]);

  const [operator, setOperator] = useState<Operator>(
    getInitialOperator(operators, fieldValue)
  );

  const [value, setValue] = useState<ValueType | undefined>(fieldValue?.value);

  const inputType = useMemo(() => {
    return getInputType(field.type, operator);
  }, [field.type, operator]);

  const handleChangeOperator = (newOperator: Operator) => {
    setOperator(newOperator);

    const newInputType = getInputType(field.type, operator);
    if (inputType !== newInputType) {
      setValue(undefined);
    }
  };

  return (
    <Menu>
      <MenuHeader title={field.name} onBackClick={onBackClick} />

      <Select<Operator>
        options={operators}
        value={operator}
        onChange={handleChangeOperator}
      />

      <CommonFilterInput type={inputType} value={value} onChange={setValue} />

      <ApplyButton
        disabled={isApplyButtonDisabled(inputType, value)}
        onClick={() => onApplyClick(operator, value!)}
      />
    </Menu>
  );
};
