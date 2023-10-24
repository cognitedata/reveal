import isEmpty from 'lodash/isEmpty';

import { OptionType } from '@cognite/cogs.js';

import { NIL_FILTER_LABEL } from '@data-exploration-lib/domain-layer';

import { MultiSelect, MultiSelectProps } from '../Select/MultiSelect';
import { OptionValue } from '../types';

import { FilterTitle } from './elements';
import { formatValue, isNilOption } from './utils';

export interface MultiSelectFilterProps<ValueType>
  extends Omit<MultiSelectProps<ValueType>, 'onChange'> {
  title?: string;
  value?: ValueType[] | OptionValue<ValueType>[];
  options: OptionType<ValueType>[];
  onChange: (
    selectedValues: ValueType[],
    selectedOptions: OptionValue<ValueType>[]
  ) => void;
}

export const MultiSelectFilter = <ValueType,>({
  title,
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
      {!isEmpty(title) && <FilterTitle>{title}</FilterTitle>}

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
