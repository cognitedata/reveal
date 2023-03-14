import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { useAssetMetadataKeys } from '@data-exploration-components/hooks/MetadataAggregateHooks';
import { ResetFiltersButton } from './ResetFiltersButton';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { AdvancedFiltersCollapse } from './AdvancedFiltersCollapse';
import { OldAssetFilters } from '@data-exploration-lib/domain-layer';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';
import { ResourceTypes } from '@data-exploration-components/types';
import head from 'lodash/head';

// TODO(CDFUX-000) allow customization of ordering of filters via props
export const AssetFilters = ({
  filter,
  setFilter,
}: {
  filter: OldAssetFilters;
  setFilter: (newFilter: OldAssetFilters) => void;
}) => {
  const resourceType = ResourceTypes.Asset;
  const { data: items = [] } = useList<any>('assets', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  const { data: metadataKeys = [] } = useAssetMetadataKeys(filter);

  return (
    <div>
      <ResetFiltersButton setFilter={setFilter} resourceType={resourceType} />
      <LabelFilter
        resourceType={resourceType}
        value={filter.labels?.map(({ value }) => ({ externalId: value }))}
        setValue={(newFilters) =>
          setFilter({
            ...filter,
            labels: newFilters?.map(({ externalId }) => ({
              value: externalId,
            })),
          })
        }
      />
      <DataSetFilter
        resourceType={resourceType}
        value={filter.dataSetIds?.map(({ value }) => ({ id: value }))}
        setValue={(newIds) =>
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
        value={head(filter.sources)?.value}
        setValue={(newSource) =>
          setFilter({
            ...filter,
            sources: [{ value: String(newSource) }],
          })
        }
      />
      <StringFilter
        title="External ID"
        value={filter.externalIdPrefix}
        setValue={(newExternalId) =>
          setFilter({
            ...filter,
            externalIdPrefix: newExternalId,
          })
        }
      />
      <AdvancedFiltersCollapse resourceType={resourceType} filter={filter}>
        <ByAssetFilter
          title="Parent"
          value={filter.assetSubtreeIds?.map(({ value }) => value)}
          setValue={(newAssetIds) =>
            setFilter({
              ...filter,
              assetSubtreeIds: newAssetIds?.map((id) => ({ value: id })),
            })
          }
        />
        <MetadataFilter
          items={items}
          keys={metadataKeys}
          value={filter.metadata}
          setValue={(newMetadata) =>
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
          setValue={(newDate) =>
            setFilter({
              ...filter,
              createdTime: newDate || undefined,
            })
          }
        />
        <DateFilter
          title="Updated Time"
          value={filter.lastUpdatedTime}
          setValue={(newDate) =>
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
