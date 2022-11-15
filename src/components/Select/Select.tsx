import React, { useCallback, useState } from 'react';

import { ActionMeta } from 'react-select';

import { OptionType } from '@cognite/cogs.js';

import { BaseSelect, BaseSelectProps } from './BaseSelect';

export interface SelectProps<ValueType>
  extends Exclude<BaseSelectProps<ValueType>, 'isMulti'> {
  value?: OptionType<ValueType>;
  onChange?: (
    value: OptionType<ValueType>,
    action: ActionMeta<OptionType<ValueType>>
  ) => void;
}

export const Select = <ValueType,>({
  value: valueOriginal,
  onChange,
  ...rest
}: SelectProps<ValueType>) => {
  const [value, setValue] = useState(valueOriginal);

  const handleChange = useCallback(
    (
      value: OptionType<ValueType>,
      action: ActionMeta<OptionType<ValueType>>
    ) => {
      setValue(value);
      onChange?.(value, action);
    },
    [onChange]
  );

  return (
    <BaseSelect
      value={value}
      onChange={handleChange}
      {...rest}
      isMulti={false}
    />
  );
};
