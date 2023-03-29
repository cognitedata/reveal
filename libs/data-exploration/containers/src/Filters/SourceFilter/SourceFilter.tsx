import {
  useAssetsUniqueValuesByProperty,
  useDocumentAggregateSourceQuery,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import {
  BaseFilter,
  BaseMultiSelectFilterProps,
  MultiSelectOptionType,
} from '../types';
import {
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  useDeepMemo,
} from '@data-exploration-lib/core';
import { transformOptionsForMultiselectFilter } from '../utils';
import { useState } from 'react';

export interface SourceFilterProps<TFilter>
  extends BaseMultiSelectFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
}

interface BaseFileSourceFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: string[];
  onChange?: (subtype: string[]) => void;
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
  return (
    <MultiSelectFilter<string>
      {...rest}
      addNilOption
      label="Source"
      options={options}
      onChange={(_, newSources) => onChange?.(newSources)}
    />
  );
};

export const BaseFileSourceFilter = <TFilter,>({
  options,
  onChange,
  value,
  ...rest
}: FileSourceFilterProps<TFilter>) => {
  return (
    <MultiSelectFilter<string>
      {...rest}
      addNilOption
      label="Source"
      value={value ? transformOptionsForMultiselectFilter(value) : undefined}
      options={options}
      onChange={(_, newSources) =>
        onChange?.(newSources.map((source) => source.value))
      }
    />
  );
};

const AssetSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalAssetFilters>
) => {
  const [query, setQuery] = useState<string | undefined>(undefined);

  const { data: sources = [] } = useAssetsUniqueValuesByProperty(
    'source',
    query
  );

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
      onInputChange={(newValue) => setQuery(newValue)}
      options={options}
    />
  );
};

const EventSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalEventsFilters>
) => {
  const { data: sources = [] } = useEventsUniqueValuesByProperty('source');

  const options = useDeepMemo(
    () =>
      sources.map((item) => ({
        label: `${item.value}`,
        value: `${item.value}`,
        count: item.count,
      })),
    [sources]
  );

  return <SourceFilter {...props} options={options} />;
};

export const FileSourceFilter = (
  props: BaseFileSourceFilterProps<InternalDocumentFilter>
) => {
  const { data: sources = [] } = useDocumentAggregateSourceQuery();

  const options = useDeepMemo(
    () =>
      sources.map((item) => ({
        label: `${item.value}`,
        value: `${item.value}`,
        count: item.count,
      })),
    [sources]
  );

  return <BaseFileSourceFilter {...props} options={options} />;
};

SourceFilter.Asset = AssetSourceFilter;

SourceFilter.Event = EventSourceFilter;

SourceFilter.File = FileSourceFilter;
