import { AllIconTypes, AutoComplete } from '@cognite/cogs.js';
import React from 'react';
import { OptionsType, ValueType } from 'react-select';

export interface Option<Value> {
  label: string;
  value: Value;
}

interface Props<OptionType extends Option<any>, IsMulti extends boolean> {
  title: string;
  options?: OptionsType<OptionType>;
  icon?: AllIconTypes;
  isLoading?: boolean;
  isMulti?: IsMulti;
  onChange(value: ValueType<OptionType, IsMulti>): void;
}

export const Select = <
  OptionType extends Option<any>,
  IsMulti extends boolean = false
>({
  title,
  onChange,
  options,
  icon,
  isLoading,
  isMulti,
}: Props<OptionType, IsMulti>) => {
  return (
    // Note that cogs.js don't have proper types to allow propagating multi.
    // This might become a problem when we start validating library
    // types (skipLibCheck is true as of this writing).
    <AutoComplete
      icon={icon}
      isLoading={isLoading}
      isMulti={isMulti}
      isClearable
      onChange={onChange}
      options={options}
      placeholder={title}
    />
  );
};
