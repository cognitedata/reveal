import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { AssetFilterProps, InternalId } from '@cognite/sdk';
import { useAssetMetadataKeys } from 'hooks/MetadataAggregateHooks';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { DateFilter } from './DateFilter/DateFilter';

// TODO(CDFUX-000) allow customization of ordering of filters via props
export const AssetFilters = ({
  filter,
  setFilter,
}: {
  filter: AssetFilterProps;
  setFilter: (newFilter: AssetFilterProps) => void;
}) => {
  const { data: items = [] } = useList('assets', { filter, limit: 1000 });

  const { data: metadataKeys = [] } = useAssetMetadataKeys(filter);

  return (
    <div>
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
      <DataSetFilter
        resourceType="asset"
        value={filter.dataSetIds}
        setValue={newIds =>
          setFilter({
            ...filter,
            dataSetIds: newIds,
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
      <StringFilter
        title="External ID"
        value={filter.externalIdPrefix}
        setValue={newExternalId =>
          setFilter({
            ...filter,
            externalIdPrefix: newExternalId,
          })
        }
      />
      <ByAssetFilter
        title="Parent"
        value={filter.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newAssetIds =>
          setFilter({
            ...filter,
            assetSubtreeIds: newAssetIds?.map(id => ({ id })),
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
      <DateFilter
        title="Created Time"
        value={filter.createdTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            createdTime: newDate || undefined,
          })
        }
      />
      <DateFilter
        title="Updated Time"
        value={filter.lastUpdatedTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            lastUpdatedTime: newDate || undefined,
          })
        }
      />
    </div>
  );
};
