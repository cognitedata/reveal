import { InputActionMeta } from 'react-select';

import {
  DATA_EXPLORATION_COMPONENT,
  InternalDocumentFilter,
  InternalEventsFilters,
  useDebouncedState,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useDocumentsFilterOptions,
  useEventsFilterOptions,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter, CommonFilterProps, MultiSelectOptionType } from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';

interface BaseTypeFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: string | string[];
  onChange?: (type: string | string[]) => void;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  addNilOption?: boolean;
}

export interface TypeFilterProps<TFilter> extends BaseTypeFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
  title?: string;
}

export function TypeFilter<TFilter>({
  options,
  onChange,
  title,
  value,
  ...rest
}: TypeFilterProps<TFilter>) {
  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const handleChange = (
    type: {
      label: string;
      value: string;
    }[]
  ) => {
    onChange?.(type.map((option) => option.value));
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_EVENT_FILTER, {
      value: type,
      title,
    });
  };

  return (
    <MultiSelectFilter<string>
      {...rest}
      label={title || t('TYPES', 'Types')}
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, type) => handleChange(type)}
      isMulti
    />
  );
}

const FileTypeFilter = (props: BaseTypeFilterProps<InternalDocumentFilter>) => {
  const { t } = useTranslation();
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useDocumentsFilterOptions({
    property: 'type',
    searchQuery: props.query,
    filter: props.filter,
    query,
  });

  return (
    <TypeFilter
      {...props}
      onInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      options={options}
      title={t('FILE_TYPES', 'File types')}
    />
  );
};

const EventTypeFilter = (props: BaseTypeFilterProps<InternalEventsFilters>) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useEventsFilterOptions({
    property: 'type',
    searchQuery: props.query,
    filter: props.filter,
    query,
  });

  return (
    <TypeFilter
      {...props}
      onInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

TypeFilter.Event = EventTypeFilter;
TypeFilter.File = FileTypeFilter;
