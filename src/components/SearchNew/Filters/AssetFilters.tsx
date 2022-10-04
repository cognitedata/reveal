import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { AssetFilterProps } from '@cognite/sdk';
import { useAssetMetadataKeys } from 'hooks/MetadataAggregateHooks';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';

// TODO(CDFUX-000) allow customization of ordering of filters via props
export const AssetFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: AssetFilterProps;
  setFilter: (newFilter: AssetFilterProps) => void;
}) => {
  const { data: items = [] } = useList('assets', { filter, limit: 1000 });

  const { data: metadataKeys = [] } = useAssetMetadataKeys(filter);

  return (
    <BaseFilterCollapse.Panel title="Assets" {...rest}>
      <LabelFilter
        resourceType="asset"
        value={((filter as any).labels || { containsAny: [] }).containsAny}
        setValue={newFilters =>
          setFilter({
            ...filter,
            labels: newFilters ? { containsAny: newFilters } : undefined,
          })
        }
      />
      <AggregatedFilter
        title="Source"
        items={items}
        aggregator="source"
        value={filter.source}
        setValue={newSource =>
          setFilter({
            ...filter,
            source: newSource,
          })
        }
      />
      <MetadataFilter
        items={items}
        keys={metadataKeys}
        value={filter.metadata}
        setValue={newMetadata =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
        useAggregates
      />
    </BaseFilterCollapse.Panel>
  );
};
