import * as React from 'react';
import { useMemo, useState } from 'react';

import { ApplyButton, Menu, MenuHeader, Select } from '../../components';
import { Field, FieldValue, Operator, ValueType } from '../../types';
import { isNoInputOperator } from '../../utils';
import { FilterInput } from '../FilterInput';

import {
  getInitialOperator,
  getInputType,
  getOperators,
  isApplyButtonDisabled,
} from './utils';

export interface CommonFilterProps {
  dataType: string;
  field: Field;
  value?: FieldValue;
  onBackClick: () => void;
  onApplyClick: (operator: Operator, value: ValueType) => void;
}

export const CommonFilter: React.FC<CommonFilterProps> = ({
  dataType,
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

  const applyButtonDisabled = isApplyButtonDisabled(inputType, value);

  const handleChangeOperator = (newOperator: Operator) => {
    setOperator(newOperator);

    const newInputType = getInputType(field.type, operator);
    if (inputType !== newInputType || isNoInputOperator(newOperator)) {
      setValue(undefined);
    }
  };

  const handleApplyClick = () => {
    onApplyClick(operator, value!);
  };

  const handleEnterPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!applyButtonDisabled && (e.key === 'Enter' || e.keyCode === 13)) {
      (e.target as any).blur();
      handleApplyClick();
    }
  };

  return (
    <div onKeyUp={handleEnterPress}>
      <Menu>
        <MenuHeader
          title={field.name}
          subtitle={dataType}
          onBackClick={onBackClick}
        />

        <Select<Operator>
          options={operators}
          value={operator}
          onChange={handleChangeOperator}
        />

        <FilterInput
          type={inputType}
          operator={operator}
          value={value}
          onChange={setValue}
          dataType={dataType}
          field={field.name}
        />

        <ApplyButton
          disabled={applyButtonDisabled}
          onClick={handleApplyClick}
        />
      </Menu>
    </div>
  );
};
