import {
  DATA_EXPLORATION_COMPONENT,
  InternalEventsFilters,
  useDebouncedState,
  useDeepMemo,
  useMetrics,
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
  const trackUsage = useMetrics();
  const filterLabel = 'Sub Type';

  const handleChange = (
    newValue: {
      label: string;
      value: string;
    }[]
  ) => {
    onChange?.(newValue.map((s) => s.value));
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_EVENT_FILTER, {
      value: newValue,
      title: filterLabel,
    });
  };

  return (
    <MultiSelectFilter<string>
      {...rest}
      label={filterLabel}
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, subtype) => handleChange(subtype)}
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
