import * as React from 'react';

import {
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  useAssetsUniqueValuesByProperty,
  useDocumentAggregateSourceQuery,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter } from '../types';

import { OptionType } from '@cognite/cogs.js';

interface BaseSourceFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: OptionType<string>[];
  onChange?: (newSources: OptionType<string>[]) => void;
  addNilOption?: boolean;
}

export interface SourceFilterProps<TFilter>
  extends BaseSourceFilterProps<TFilter> {
  options: OptionType<string>[];
}

export function SourceFilter<TFilter>({
  options,
  onChange,
  ...rest
}: SourceFilterProps<TFilter>) {
  return (
    <MultiSelectFilter<string>
      addNilOption
      {...rest}
      title="Source"
      options={options}
      onChange={(_, newSources) => onChange?.(newSources)}
    />
  );
}

const AssetSourceFilter = (
  props: BaseSourceFilterProps<InternalAssetFilters>
) => {
  const { data: sources = [] } = useAssetsUniqueValuesByProperty('source');

  const mappedSources = sources.map((item) => ({
    label: `${item.value}`,
    value: String(item.value),
  }));

  return <SourceFilter {...props} options={mappedSources} />;
};

SourceFilter.Asset = AssetSourceFilter;

const EventSourceFilter = (
  props: BaseSourceFilterProps<InternalEventsFilters>
) => {
  const { data: sources = [] } = useEventsUniqueValuesByProperty('source');

  const mappedSources = sources.map((item) => ({
    label: `${item.value}`,
    value: String(item.value),
  }));

  return <SourceFilter {...props} options={mappedSources} />;
};

export const FileSourceFilter = (
  props: BaseSourceFilterProps<InternalDocumentFilter>
) => {
  const { data: sources = [] } = useDocumentAggregateSourceQuery();
  const mappedSources = sources.map((item) => ({
    label: item.label,
    value: item.value,
  }));

  return <SourceFilter {...props} options={mappedSources} />;
};

SourceFilter.Event = EventSourceFilter;

SourceFilter.File = FileSourceFilter;
