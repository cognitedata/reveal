import {
  useAssetsUniqueValuesByProperty,
  useDocumentAggregateSourceQuery,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseMultiSelectFilterProps } from '../types';
import { OptionType } from '@cognite/cogs.js';
import {
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
} from '@data-exploration-lib/core';

export interface SourceFilterProps<TFilter>
  extends BaseMultiSelectFilterProps<TFilter> {
  options: OptionType<string>[];
}

export const SourceFilter = <TFilter,>({
  options,
  onChange,
  ...rest
}: SourceFilterProps<TFilter>) => {
  return (
    <MultiSelectFilter<string>
      addNilOption
      {...rest}
      label="Source"
      options={options}
      onChange={(_, newSources) => onChange?.(newSources)}
    />
  );
};

const AssetSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalAssetFilters>
) => {
  const { data: sources = [] } = useAssetsUniqueValuesByProperty('source');

  const options = sources.map((item) => ({
    label: `${item.value}`,
    value: `${item.value}`,
  }));

  return <SourceFilter {...props} options={options} />;
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
  props: BaseMultiSelectFilterProps<InternalDocumentFilter>
) => {
  const { data: sources = [] } = useDocumentAggregateSourceQuery();
  const options = sources.map((item) => ({
    label: item.label,
    value: item.value,
  }));

  return <SourceFilter {...props} options={options} />;
};

SourceFilter.Asset = AssetSourceFilter;

SourceFilter.Event = EventSourceFilter;

SourceFilter.File = FileSourceFilter;
