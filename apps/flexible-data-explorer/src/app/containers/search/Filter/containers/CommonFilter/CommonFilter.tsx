import { useMemo, useState } from 'react';

import { ApplyButton, Menu, MenuHeader, Select } from '../../components';
import { BaseConfig, BaseFilterProps, ValueType } from '../../types';

import { CommonFilterInput } from './CommonFilterInput';
import {
  getInitialOperator,
  getInitialValue,
  isApplyButtonDisabled,
} from './utils';

export interface CommonFilterProps<TConfig extends BaseConfig>
  extends BaseFilterProps<TConfig> {
  config: TConfig;
}

export const CommonFilter = <
  TOperator extends string,
  TConfig extends BaseConfig
>({
  config,
  value: fieldValue,
  name,
  onBackClick,
  onApplyClick,
}: CommonFilterProps<TConfig>) => {
  const operators = useMemo(() => {
    return Object.keys(config) as TOperator[];
  }, [config]);

  const [operator, setOperator] = useState<TOperator>(
    getInitialOperator(operators, fieldValue)
  );

  const [value, setValue] = useState<ValueType<TConfig[TOperator]> | undefined>(
    getInitialValue(operators, fieldValue)
  );

  const inputType = config[operator];

  const handleChangeOperator = (newOperator: TOperator) => {
    setOperator(newOperator);

    const newInputType = config[newOperator];
    if (inputType !== newInputType) {
      setValue(undefined);
    }
  };

  return (
    <Menu>
      <MenuHeader title={name} onBackClick={onBackClick} />

      <Select<TOperator>
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
