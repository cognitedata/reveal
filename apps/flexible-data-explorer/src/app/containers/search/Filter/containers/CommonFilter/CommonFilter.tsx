import { useEffect, useMemo, useState } from 'react';

import { ApplyButton, Menu, MenuHeader, Select } from '../../components';
import { BaseConfig, BaseFilterProps, ValueType } from '../../types';

import { CommonFilterInput } from './CommonFilterInput';
import { isApplyButtonDisabled } from './utils';

export interface CommonFilterProps<TConfig extends BaseConfig>
  extends BaseFilterProps<TConfig> {
  config: TConfig;
}

export const CommonFilter = <
  TOperator extends string,
  TConfig extends BaseConfig
>({
  config,
  name,
  onBackClick,
  onApplyClick,
}: CommonFilterProps<TConfig>) => {
  const operators = useMemo(() => {
    return Object.keys(config) as TOperator[];
  }, [config]);

  const [operator, setOperator] = useState<TOperator>(operators[0]);
  const [value, setValue] = useState<ValueType<TConfig[TOperator]>>();

  const inputType = config[operator];

  useEffect(() => {
    setValue(undefined);
  }, [inputType]);

  return (
    <Menu>
      <MenuHeader title={name} onBackClick={onBackClick} />

      <Select<TOperator>
        options={operators}
        value={operator}
        onChange={setOperator}
      />

      <CommonFilterInput type={inputType} value={value} onChange={setValue} />

      <ApplyButton
        disabled={isApplyButtonDisabled(inputType, value)}
        onClick={() => onApplyClick(operator, value!)}
      />
    </Menu>
  );
};
