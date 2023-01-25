import { OptionType } from '@cognite/cogs.js';
import {
  MultiSelect,
  MultiSelectProps,
} from '@data-exploration-components/components';
import { FilterTitle } from './FilterTitle';

// Note: use MultiSelectFilter filter from component libs. this is going to be removed in near future.

import { OptionValue } from '@data-exploration-components/components/SearchNew/Filters/types';

interface MultiSelectFilterProps
  extends Omit<MultiSelectProps<string>, 'onChange'> {
  title: string;
  value?: OptionValue<string>[];
  options: OptionType<any>[];
  onChange: (newValue: string[]) => void;
}
export const MultiSelectFilter = ({
  title,
  value,
  onChange,
  ...rest
}: MultiSelectFilterProps) => {
  return (
    <>
      <FilterTitle>{title}</FilterTitle>

      <MultiSelect
        {...rest}
        data-testid="multi-select-filter"
        onChange={(newValue) => {
          const tempValue = newValue?.map((item) => item.value);
          onChange(tempValue);
        }}
        value={value as OptionType<string>[]}
        isSearchable
        isClearable
        menuPosition="fixed"
        theme="grey"
      />
    </>
  );
};
