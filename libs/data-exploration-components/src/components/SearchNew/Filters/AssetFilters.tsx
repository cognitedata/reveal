import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { useAssetMetadataKeys } from 'hooks/MetadataAggregateHooks';
import { LabelFilterV2 } from './LabelFilter/LabelFilter';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
import { AggregatedFilterV2 } from './AggregatedFilter/AggregatedFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';
import { InternalAssetFilters } from 'domain/assets';
import { transformNewFilterToOldFilter } from 'domain/transformers';

// TODO(CDFUX-000) allow customization of ordering of filters via props
export const AssetFiltersV2 = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: InternalAssetFilters;
  setFilter: (newFilter: InternalAssetFilters) => void;
}) => {
  const { data: items = [] } = useList('assets', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  const { data: metadataKeys = [] } = useAssetMetadataKeys(filter);

  return (
    <BaseFilterCollapse.Panel title="Assets" {...rest}>
      <LabelFilterV2
        resourceType="asset"
        value={filter.labels}
        setValue={newFilters =>
          setFilter({
            ...filter,
            labels: newFilters,
          })
        }
      />
      <AggregatedFilterV2
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
      <MetadataFilterV2
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
