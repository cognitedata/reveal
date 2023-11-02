import { InputActionMeta } from 'react-select';

import {
  DATA_EXPLORATION_COMPONENT,
  InternalEventsFilters,
  useDebouncedState,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';
import { useEventsFilterOptions } from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter, CommonFilterProps, MultiSelectOptionType } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';

interface BaseSubTypeFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: string | string[];
  onChange?: (subtype: string | string[]) => void;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  addNilOption?: boolean;
  menuPortalTarget?: HTMLElement;
}

export interface SubTypeFilterProps<TFilter>
  extends BaseSubTypeFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
  menuPortalTarget?: HTMLElement;
}

export function SubTypeFilter<TFilter>({
  options,
  onChange,
  value,
  ...rest
}: SubTypeFilterProps<TFilter>) {
  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const filterLabel = t('SUBTYPES', 'Subtypes');

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
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useEventsFilterOptions({
    property: 'subtype',
    searchQuery: props.query,
    filter: props.filter,
    query,
  });

  return (
    <SubTypeFilter
      {...props}
      onInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

SubTypeFilter.Event = EventSubTypeFilter;
