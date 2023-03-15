import {
  InternalAssetFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  useAssetsUniqueValuesByProperty,
  useDocumentAggregateSourceQuery,
  useEventsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseMultiSelectFilterProps } from '../types';
import { OptionType } from '@cognite/cogs.js';

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
      title="Source"
      options={options}
      onChange={(_, newSources) => onChange?.(newSources)}
    />
  );
};

const AssetSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalAssetFilters>
) => {
  const { data: sources = [] } = useAssetsUniqueValuesByProperty('source');

  const mappedSources = sources.map((item) => ({
    label: `${item.value}`,
    value: String(item.value),
  }));

  return <SourceFilter {...props} options={mappedSources} />;
};

const EventSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalEventsFilters>
) => {
  const { data: sources = [] } = useEventsUniqueValuesByProperty('source');

  const mappedSources = sources.map((item) => ({
    label: `${item.value}`,
    value: String(item.value),
  }));

  return <SourceFilter {...props} options={mappedSources} />;
};

export const FileSourceFilter = (
  props: BaseMultiSelectFilterProps<InternalDocumentFilter>
) => {
  const { data: sources = [] } = useDocumentAggregateSourceQuery();
  const mappedSources = sources.map((item) => ({
    label: item.label,
    value: item.value,
  }));

  return <SourceFilter {...props} options={mappedSources} />;
};

SourceFilter.Asset = AssetSourceFilter;

SourceFilter.Event = EventSourceFilter;

SourceFilter.File = FileSourceFilter;
