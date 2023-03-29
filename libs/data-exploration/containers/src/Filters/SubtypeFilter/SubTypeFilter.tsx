import { InternalEventsFilters, useDeepMemo } from '@data-exploration-lib/core';
import { useEventsUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter, CommonFilterProps, MultiSelectOptionType } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';

interface BaseSubTypeFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: string | string[];
  onChange?: (subtype: string | string[]) => void;
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
  const {
    data = [],
    isLoading,
    isError,
  } = useEventsUniqueValuesByProperty('subtype', props.filter);

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
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

SubTypeFilter.Event = EventSubTypeFilter;
