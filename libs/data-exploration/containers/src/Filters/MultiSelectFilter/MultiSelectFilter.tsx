import { OptionType } from '@cognite/cogs.js';

import isEmpty from 'lodash/isEmpty';

// import {
//   MultiSelect,
//   MultiSelectProps,
// } from '@data-exploration-components/components';
import { NIL_FILTER_LABEL } from '@data-exploration-lib/domain-layer';

import { formatValue, isNilOption } from './utils';
import {
  FilterLabel,
  MultiSelect,
  MultiSelectProps,
} from '@data-exploration/components';

export interface MultiSelectFilterProps<ValueType>
  extends Omit<MultiSelectProps<ValueType>, 'onChange'> {
  label?: string;
  value?:
    | ValueType[]
    | OptionType<ValueType>[]
    | { label?: string; value: ValueType }[];
  options: OptionType<ValueType>[] | { label?: string; value: ValueType }[];
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
  ...rest
}: MultiSelectFilterProps<ValueType>) => {
  const handleChange = (newOptions: OptionType<ValueType | undefined>[]) => {
    const selectedOptions = newOptions.map((option) => ({
      label: isNilOption(option) ? NIL_FILTER_LABEL : option.label,
      value: option.value as ValueType,
    }));

    const selectedValues = selectedOptions.map((option) => option.value);

    onChange(selectedValues, selectedOptions);
  };

  const options = defaultOptions.map((item) => {
    return {
      ...item,
      label: item.label || String(item.value),
      value: item.value,
    };
  });

  return (
    <>
      {!isEmpty(label) && <FilterLabel>{label}</FilterLabel>}

      <MultiSelect<ValueType | undefined>
        {...rest}
        options={options}
        data-testid="multi-select-filter"
        value={formatValue(value)}
        onChange={handleChange}
        isSearchable
        isClearable
        menuPosition="fixed"
        theme="grey"
      />
    </>
  );
};
