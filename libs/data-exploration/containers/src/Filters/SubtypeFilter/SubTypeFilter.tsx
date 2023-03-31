import {
  InternalEventsFilters,
  useDebouncedState,
  useDeepMemo,
} from '@data-exploration-lib/core';
import { useEventsUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter, CommonFilterProps, MultiSelectOptionType } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';
import { InputActionMeta } from 'react-select';

interface BaseSubTypeFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: string | string[];
  onChange?: (subtype: string | string[]) => void;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  addNilOption?: boolean;
}

export interface SubTypeFilterProps<TFilter>
  extends BaseSubTypeFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
}

export function SubTypeFilter<TFilter>({
  options,
  onChange,
  value,
  ...rest
}: SubTypeFilterProps<TFilter>) {
  return (
    <MultiSelectFilter<string>
      {...rest}
      label="Sub Type"
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, subtype) => onChange?.(subtype.map((s) => s.value))}
    />
  );
}

const EventSubTypeFilter = (
  props: BaseSubTypeFilterProps<InternalEventsFilters>
) => {
  const [query, setQuery] = useDebouncedState<string | undefined>(undefined);

  const {
    data = [],
    isLoading,
    isError,
  } = useEventsUniqueValuesByProperty('subtype', query, props.filter, {
    keepPreviousData: true,
  });

  const options = useDeepMemo(
    () =>
      data.map((item) => ({
        label: String(item.value),
        value: String(item.value),
        count: item.count,
      })),
    [data]
  );

  return (
    <SubTypeFilter
      {...props}
      onInputChange={(newValue) => setQuery(newValue)}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

SubTypeFilter.Event = EventSubTypeFilter;
