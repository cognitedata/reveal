import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { useAssetMetadataKeys } from 'hooks/MetadataAggregateHooks';
import { ResetFiltersButton } from './ResetFiltersButton';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { AdvancedFiltersCollapse } from './AdvancedFiltersCollapse';
import { OldAssetFilters } from 'domain/assets';
import { transformNewFilterToOldFilter } from 'domain/transformers';

// TODO(CDFUX-000) allow customization of ordering of filters via props
export const AssetFilters = ({
  filter,
  setFilter,
}: {
  filter: OldAssetFilters;
  setFilter: (newFilter: OldAssetFilters) => void;
}) => {
  const { data: items = [] } = useList('assets', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  const { data: metadataKeys = [] } = useAssetMetadataKeys(filter);

  return (
    <div>
      <ResetFiltersButton setFilter={setFilter} />
      <LabelFilter
        resourceType="asset"
        value={filter.labels?.map(({ value }) => ({ externalId: value }))}
        setValue={newFilters =>
          setFilter({
            ...filter,
            labels: newFilters?.map(({ externalId }) => ({
              value: externalId,
            })),
          })
        }
      />
      <DataSetFilter
        resourceType="asset"
        value={filter.dataSetIds?.map(({ value }) => ({ id: value }))}
        setValue={newIds =>
          setFilter({
            ...filter,
            dataSetIds: newIds?.map(({ id }: any) => ({ value: id })),
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
      <AdvancedFiltersCollapse resourceType="asset" filter={filter}>
        <ByAssetFilter
          title="Parent"
          value={filter.assetSubtreeIds?.map(({ value }) => value)}
          setValue={newAssetIds =>
            setFilter({
              ...filter,
              assetSubtreeIds: newAssetIds?.map(id => ({ value: id })),
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
      </AdvancedFiltersCollapse>
    </div>
  );
};
