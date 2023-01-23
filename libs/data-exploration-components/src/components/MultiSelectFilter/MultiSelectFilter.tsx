import { OptionType } from '@cognite/cogs.js';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

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

export interface MultiSelectFilterProps<ValueType extends string | number>
  extends Omit<MultiSelectProps<ValueType>, 'onChange'> {
  title?: string;
  value?: OptionValue<ValueType>[];
  options: OptionType<ValueType>[];
  onChange: (selectedValues: OptionValue<ValueType>[]) => void;
}

export const MultiSelectFilter = <ValueType extends string | number>({
  title,
  value,
  onChange,
  ...rest
}: MultiSelectFilterProps<ValueType>) => {
  const handleChange = (selectedOptions: OptionType<ValueType>[]) => {
    onChange(
      selectedOptions.map((option) => ({
        label:
          option.value === NIL_FILTER_VALUE ? NIL_FILTER_LABEL : option.label,
        value: option.value as ValueType,
      }))
    );
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
