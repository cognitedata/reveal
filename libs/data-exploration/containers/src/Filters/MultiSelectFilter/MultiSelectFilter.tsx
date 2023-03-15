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
  value?: ValueType[] | OptionType<ValueType>[];
  options: OptionType<ValueType>[];
  onChange: (
    selectedValues: ValueType[],
    selectedOptions: OptionType<ValueType>[]
  ) => void;
}

export const MultiSelectFilter = <ValueType,>({
  label,
  value,
  onChange,
  ...rest
}: MultiSelectFilterProps<ValueType>) => {
  const handleChange = (options: OptionType<ValueType>[]) => {
    const selectedOptions = options.map((option) => ({
      label: isNilOption(option) ? NIL_FILTER_LABEL : option.label,
      value: option.value as ValueType,
    }));

    const selectedValues = selectedOptions.map((option) => option.value);

    onChange(selectedValues, selectedOptions);
  };

  return (
    <>
      {!isEmpty(label) && <FilterLabel>{label}</FilterLabel>}

      <MultiSelect
        {...rest}
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
