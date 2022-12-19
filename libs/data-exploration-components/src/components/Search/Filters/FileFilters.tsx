import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { ResetFiltersButton } from './ResetFiltersButton';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { AdvancedFiltersCollapse } from './AdvancedFiltersCollapse';
import { OldFilesFilters } from '@data-exploration-components/domain/files';
import { transformNewFilterToOldFilter } from '@data-exploration-components/domain/transformers';
import { ResourceTypes } from '@data-exploration-components/types';

export const FileFilters = ({
  filter,
  setFilter,
}: {
  filter: OldFilesFilters;
  setFilter: (newFilter: OldFilesFilters) => void;
}) => {
  const resourceType = ResourceTypes.File;
  const { data: items = [] } = useList<any>('files', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <div>
      <ResetFiltersButton setFilter={setFilter} resourceType={resourceType} />
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
        items={items}
        aggregator="mimeType"
        title="Mime type"
        value={filter.mimeType}
        setValue={(newValue) => setFilter({ ...filter, mimeType: newValue })}
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
      <DateFilter
        title="Source Modified Time"
        value={filter.sourceModifiedTime}
        setValue={(newDate) =>
          setFilter({
            ...filter,
            sourceModifiedTime: newDate || undefined,
          })
        }
      />
      <AdvancedFiltersCollapse resourceType={resourceType} filter={filter}>
        <LabelFilter
          resourceType={resourceType}
          value={filter.labels?.map(({ value }) => ({ externalId: value }))}
          setValue={(newFilters) =>
            setFilter({
              ...filter,
              labels: newFilters
                ? newFilters?.map(({ externalId }) => ({ value: externalId }))
                : undefined,
            })
          }
        />
        <ByAssetFilter
          value={filter.assetSubtreeIds?.map(({ value }) => value)}
          setValue={(newValue) =>
            setFilter({
              ...filter,
              assetSubtreeIds: newValue?.map((id) => ({ value: id })),
            })
          }
        />
        <DateFilter
          title="Uploaded Time"
          value={filter.uploadedTime}
          setValue={(newDate) =>
            setFilter({
              ...filter,
              uploadedTime: newDate || undefined,
            })
          }
        />
        <StringFilter
          title="Directory prefix"
          value={(filter as any).directoryPrefix}
          setValue={(newPrefix) =>
            setFilter({
              ...filter,
              // @ts-ignore
              directoryPrefix: newPrefix,
            })
          }
        />
        <AggregatedFilter
          title="Source"
          items={items}
          aggregator="source"
          value={filter.source}
          setValue={(newSource) =>
            setFilter({
              ...filter,
              source: newSource,
            })
          }
        />
        <MetadataFilter
          items={items}
          value={filter.metadata}
          setValue={(newMetadata) =>
            setFilter({
              ...filter,
              metadata: newMetadata,
            })
          }
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
        <DateFilter
          title="Source Created Time"
          value={filter.sourceCreatedTime}
          setValue={(newDate) =>
            setFilter({
              ...filter,
              sourceCreatedTime: newDate || undefined,
            })
          }
        />
      </AdvancedFiltersCollapse>
    </div>
  );
};
