// import {
//   MultiSelect,
//   MultiSelectProps,
// } from '@data-exploration-components'

import { InputActionMeta } from 'react-select';

import {
  FilterLabel,
  MultiSelect,
  MultiSelectProps,
} from '@data-exploration/components';
import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';

import { OptionType } from '@cognite/cogs.js';

import { NOT_SET, zIndex } from '@data-exploration-lib/core';

import { MultiSelectOptionType } from '../types';

import { formatValue, isNilOption } from './utils';

export interface MultiSelectFilterProps<ValueType>
  extends Omit<MultiSelectProps<ValueType>, 'onChange'> {
  label?: string;

  value?:
    | ValueType[]
    | OptionType<ValueType>[]
    | { label?: string; value: ValueType }[];

  options: OptionType<ValueType>[] | MultiSelectOptionType<ValueType>[];

  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  onChange: (
    selectedValues: ValueType[],
    selectedOptions: {
      label: string;
      value: ValueType;
    }[]
  ) => void;
}

export const MultiSelectFilter = <ValueType,>({
  label,
  value,
  onChange,
  options: defaultOptions,
  isLoading,
  isError,
  ...rest
}: MultiSelectFilterProps<ValueType>) => {
  const handleChange = (newOptions: OptionType<ValueType | undefined>[]) => {
    const selectedOptions = compact(
      newOptions.map((option) => {
        if (option.count === 0) {
          return null;
        }

        return {
          label: isNilOption(option) ? NOT_SET : option.label,
          value: option.value as ValueType,
        };
      })
    );

    const selectedValues = selectedOptions.map((option) => option.value);

    onChange(selectedValues, selectedOptions);
  };

  const options = defaultOptions.map((item) => {
    return {
      ...item,
      label: item.label || String(item.value),
      value: item.value,
      count: item.count,
    };
  });

  return (
    <div data-testid={`filter-${label}`}>
      {!isEmpty(label) && <FilterLabel>{label}</FilterLabel>}

      <MultiSelect<ValueType | undefined>
        {...rest}
        data-testid={`select-${label}`}
        isLoading={isLoading}
        isError={isError}
        options={options}
        value={formatValue(value)}
        onChange={handleChange}
        isSearchable
        isClearable
        menuPosition="fixed"
        theme="grey"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: zIndex.MAXIMUM }),
          menu: (provided) => ({
            ...provided,
            zIndex: `${zIndex.MAXIMUM} !important`,
          }),
        }}
      />
    </div>
  );
};
