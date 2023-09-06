import { InputActionMeta } from 'react-select';

import {
  DATA_EXPLORATION_COMPONENT,
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  useDebouncedState,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useAssetsFilterOptions,
  useDocumentsFilterOptions,
  useEventsFilterOptions,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import {
  BaseFilter,
  BaseMultiSelectFilterProps,
  CommonFilterProps,
  MultiSelectOptionType,
} from '../types';
import { transformOptionsForMultiselectFilter } from '../utils';

export interface SourceFilterProps<TFilter>
  extends BaseMultiSelectFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
}

interface BaseFileSourceFilterProps<TFilter>
  extends BaseFilter<TFilter>,
    CommonFilterProps {
  value?: string[];
  onChange?: (subtype: string[]) => void;
  onInputChange?: (newValue: string, actionMeta: InputActionMeta) => void;
  query?: string;
  addNilOption?: boolean;
}
export interface FileSourceFilterProps<TFilter>
  extends BaseFileSourceFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
}

export const SourceFilter = <TFilter,>({
  options,
  onChange,
  ...rest
}: SourceFilterProps<TFilter>) => {
  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const handleChange = (
    sources: {
      label: string;
      value: string;
    }[]
  ) => {
    onChange?.(sources);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_FILTER, {
      value: sources,
      title: 'Source Filter',
    });
  };

  return (
    <MultiSelectFilter<string>
      {...rest}
      addNilOption
      label={t('SOURCES', 'Sources')}
      options={options}
      onChange={(_, newSources) => handleChange(newSources)}
    />
  );
};

export const BaseFileSourceFilter = <TFilter,>({
  options,
  onChange,
  value,
  ...rest
}: FileSourceFilterProps<TFilter>) => {
  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const handleChange = (
    newSources: {
      label: string;
      value: string;
    }[]
  ) => {
    onChange?.(newSources.map((source) => source.value));
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_FILTER, {
      value: newSources,
      title: 'File Source',
    });
  };

  return (
    <MultiSelectFilter<string>
      {...rest}
      addNilOption
      label={t('SOURCES', 'Sources')}
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, newSources) => handleChange(newSources)}
    />
  );
};

const AssetSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalAssetFilters>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useAssetsFilterOptions({
    property: 'source',
    filterProperty: 'sources',
    searchQuery: props.query,
    filter: props.filter,
    query,
  });

  return (
    <SourceFilter
      {...props}
      onInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

const EventSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalEventsFilters>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useEventsFilterOptions({
    property: 'source',
    filterProperty: 'sources',
    searchQuery: props.query,
    filter: props.filter,
    query,
  });

  return (
    <SourceFilter
      {...props}
      onInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

export const FileSourceFilter = (
  props: BaseFileSourceFilterProps<InternalDocumentFilter>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useDocumentsFilterOptions({
    property: ['sourceFile', 'source'],
    searchQuery: props.query,
    filter: props.filter,
    query,
  });

  return (
    <BaseFileSourceFilter
      {...props}
      onInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

SourceFilter.Asset = AssetSourceFilter;

SourceFilter.Event = EventSourceFilter;

SourceFilter.File = FileSourceFilter;
