import { OptionType } from '@cognite/cogs.js';

import isEmpty from 'lodash/isEmpty';

import {
  MultiSelect,
  MultiSelectProps,
} from '@data-exploration-components/components';
import {
  NIL_FILTER_VALUE,
  NIL_FILTER_LABEL,
} from '@data-exploration-lib/domain-layer';

import { FilterTitle } from './elements';
import { OptionValue } from '../SearchNew/Filters/types';
import { isNilOption } from './utils';

export interface MultiSelectFilterProps<ValueType>
  extends Omit<MultiSelectProps<ValueType>, 'onChange'> {
  title?: string;
  value?: OptionValue<ValueType>[];
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
        value={value as OptionType<ValueType>[]}
        onChange={handleChange}
        isSearchable
        isClearable
        menuPosition="fixed"
        theme="grey"
      />
    </>
  );
};
