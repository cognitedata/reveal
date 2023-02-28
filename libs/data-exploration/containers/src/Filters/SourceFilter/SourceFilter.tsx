import * as React from 'react';

import { extractSources } from './utils';
import {
  InternalAssetFilters,
  InternalEventsFilters,
  transformNewFilterToOldFilter,
  useAssetsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseFilter } from '../types';
import { useList } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk/dist/src';

interface BaseSourceFilterProps<TFilter> extends BaseFilter<TFilter> {
  value?: OptionValue<string>[];
  onChange?: (newSources: OptionValue<string>[]) => void;
  addNilOption?: boolean;
}

export interface SourceFilterProps<
  TData extends { source?: string | number },
  TFilter
> extends BaseSourceFilterProps<TFilter> {
  items: TData[];
}

//TODO: Move this type to a more common place (core? or maybe in ../types)
export type OptionValue<ValueType> = {
  label?: string;
  value: ValueType;
};

export const SourceFilter = <
  TData extends { source?: string | number },
  TFilter
>({
  items,
  onChange,
  ...rest
}: SourceFilterProps<TData, TFilter>) => {
  const options = React.useMemo(() => {
    return extractSources(items).map((option) => ({
      label: option,
      value: option,
    }));
  }, [items]);

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
  props: BaseSourceFilterProps<InternalAssetFilters>
) => {
  const { data: sources = [] } = useAssetsUniqueValuesByProperty('source');

  const mappedSources = sources.map((item) => ({ source: item.value }));

  return <SourceFilter {...props} items={mappedSources} />;
};

SourceFilter.Asset = AssetSourceFilter;

const EventSourceFilter = ({
  filter,
  ...rest
}: BaseSourceFilterProps<InternalEventsFilters>) => {
  const { data: items = [] } = useList<CogniteEvent>('events', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return <SourceFilter {...rest} items={items} />;
};

SourceFilter.Event = EventSourceFilter;
