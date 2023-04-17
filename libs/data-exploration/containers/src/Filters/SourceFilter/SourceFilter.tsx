import {
  useAssetsUniqueValuesByProperty,
  useDocumentsUniqueValuesByProperty,
  useEventsFilterOptions,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import {
  BaseFilter,
  BaseMultiSelectFilterProps,
  CommonFilterProps,
  MultiSelectOptionType,
} from '../types';

import {
  DATA_EXPLORATION_COMPONENT,
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  useDebouncedState,
  useDeepMemo,
  useMetrics,
} from '@data-exploration-lib/core';
import { transformOptionsForMultiselectFilter } from '../utils';
import { InputActionMeta } from 'react-select';

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
      label="Source"
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
      label="Source"
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, newSources) => handleChange(newSources)}
    />
  );
};

const AssetSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalAssetFilters>
) => {
  const [query, setQuery] = useDebouncedState<string | undefined>(undefined);

  const {
    data: sources = [],
    isLoading,
    isError,
  } = useAssetsUniqueValuesByProperty('source', query);

  const options = useDeepMemo(
    () =>
      sources.map((item) => ({
        label: `${item.value}`,
        value: `${item.value}`,
        count: item.count,
      })),
    [sources]
  );

  return (
    <SourceFilter
      {...props}
      isError={isError}
      isLoading={isLoading}
      onInputChange={(newValue) => setQuery(newValue)}
      options={options}
    />
  );
};

const EventSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalEventsFilters>
) => {
  const [prefix, setPrefix] = useDebouncedState<string>();

  const { options, isLoading, isError } = useEventsFilterOptions({
    property: 'source',
    filterProperty: 'sources',
    query: props.query,
    filter: props.filter,
    prefix,
  });

  return (
    <SourceFilter
      {...props}
      onInputChange={setPrefix}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

export const FileSourceFilter = (
  props: BaseFileSourceFilterProps<InternalDocumentFilter>
) => {
  const [query, setQuery] = useDebouncedState<string | undefined>(undefined);

  const {
    data: sources = [],
    isLoading,
    isError,
  } = useDocumentsUniqueValuesByProperty(['sourceFile', 'source'], query, {
    keepPreviousData: true,
  });

  const options = useDeepMemo(
    () =>
      sources.map((item) => ({
        label: `${item.value}`,
        value: `${item.value}`,
        count: item.count,
      })),
    [sources]
  );

  return (
    <BaseFileSourceFilter
      {...props}
      onInputChange={(newValue) => setQuery(newValue)}
      isError={isError}
      isLoading={isLoading}
      options={options}
    />
  );
};

SourceFilter.Asset = AssetSourceFilter;

SourceFilter.Event = EventSourceFilter;

SourceFilter.File = FileSourceFilter;
