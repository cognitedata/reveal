import { InternalEventsFilters } from '@data-exploration-lib/core';
import { useEventsUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';

interface BaseSubTypeFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: string | string[];
  onChange?: (subtype: string | string[]) => void;
  addNilOption?: boolean;
}

export interface SubTypeFilterProps<TFilter>
  extends BaseSubTypeFilterProps<TFilter> {
  options: string | string[];
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
      options={transformOptionsForMultiselectFilter(options)}
      onChange={(_, subtype) => onChange?.(subtype.map((s) => s.value))}
    />
  );
}

const EventSubTypeFilter = (
  props: BaseSubTypeFilterProps<InternalEventsFilters>
) => {
  const { data = [] } = useEventsUniqueValuesByProperty(
    'subtype',
    props.filter
  );
  const options = data.map((item) => `${item.value}`);

  return <SubTypeFilter {...props} options={options} />;
};

SubTypeFilter.Event = EventSubTypeFilter;
