import {
  useAssetsUniqueValuesByProperty,
  useDocumentAggregateSourceQuery,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter, BaseMultiSelectFilterProps } from '../types';
import { OptionType } from '@cognite/cogs.js';
import {
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
} from '@data-exploration-lib/core';
import { transformOptionsForMultiselectFilter } from '../utils';
import { useState } from 'react';

export interface SourceFilterProps<TFilter>
  extends BaseMultiSelectFilterProps<TFilter> {
  options: OptionType<string>[];
}

interface BaseFileSourceFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: string[];
  onChange?: (subtype: string[]) => void;
  addNilOption?: boolean;
}
export interface FileSourceFilterProps<TFilter>
  extends BaseFileSourceFilterProps<TFilter> {
  options: string[];
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
      options={transformOptionsForMultiselectFilter(options)}
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

  const options = sources.map((item) => ({
    label: `${item.value}`,
    value: `${item.value}`,
  }));

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

  const options = sources.map((item) => ({
    label: `${item.value}`,
    value: `${item.value}`,
  }));

  return <SourceFilter {...props} options={options} />;
};

export const FileSourceFilter = (
  props: BaseFileSourceFilterProps<InternalDocumentFilter>
) => {
  const { data: sources = [] } = useDocumentAggregateSourceQuery();

  const options = sources.map((item) => `${item.value}`);

  return <BaseFileSourceFilter {...props} options={options} />;
};

SourceFilter.Asset = AssetSourceFilter;

SourceFilter.Event = EventSourceFilter;

SourceFilter.File = FileSourceFilter;
