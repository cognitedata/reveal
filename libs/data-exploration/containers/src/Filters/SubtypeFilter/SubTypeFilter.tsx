import { OptionType } from '@cognite/cogs.js';
import {
  InternalEventsFilters,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter } from '../types';

interface BaseSubTypeFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: OptionType<string>[];
  onChange?: (subtype: OptionType<string>[]) => void;
  addNilOption?: boolean;
}

export interface SubTypeFilterProps<TFilter>
  extends BaseSubTypeFilterProps<TFilter> {
  options: OptionType<string>[];
}

export function SubTypeFilter<TFilter>({
  options,
  onChange,
  ...rest
}: SubTypeFilterProps<TFilter>) {
  return (
    <MultiSelectFilter<string>
      {...rest}
      label="Sub Type"
      options={options}
      onChange={(_, subtype) => onChange?.(subtype)}
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
  const options = data.map((item) => ({
    label: `${item.value}`,
    value: `${item.value}`,
  }));

  return <SubTypeFilter {...props} options={options} />;
};

SubTypeFilter.Event = EventSubTypeFilter;
