import * as React from 'react';
import { useMemo, useState } from 'react';

import { ApplyButton, Menu, MenuHeader, Select } from '../../components';
import { Field, FieldValue, Operator, ValueType } from '../../types';

import { CommonFilterInput } from './CommonFilterInput';
import {
  getConfig,
  getInitialOperator,
  getInitialValue,
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
  const config = useMemo(() => {
    return getConfig(field);
  }, [field]);

  const operators = useMemo(() => {
    return Object.keys(config) as Operator[];
  }, [config]);

  const [operator, setOperator] = useState<Operator>(
    getInitialOperator(operators, fieldValue)
  );

  const [value, setValue] = useState<ValueType | undefined>(
    getInitialValue(operators, fieldValue)
  );

  const inputType = config[operator] || 'no-input';

  const handleChangeOperator = (newOperator: Operator) => {
    setOperator(newOperator);

    const newInputType = config[newOperator];
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
