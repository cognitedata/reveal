import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { FileFilterProps, InternalId } from '@cognite/sdk';
import {
  LabelFilter,
  MetadataFilter,
  DataSetFilter,
  ByAssetFilter,
  AggregatedFilter,
  StringFilter,
} from '@cognite/data-exploration';
import { DateFilter } from './DateFilter'; // For some reason DateFiler is not included in last version of data-exploration

export const FileFilters = ({
  filter,
  setFilter,
}: {
  filter: FileFilterProps;
  setFilter: (newFilter: FileFilterProps) => void;
}) => {
  const { data: items = [] } = useList('files', { filter, limit: 1000 });
  return (
    <div>
      {/* Add annotation filter */}
      <DataSetFilter
        resourceType="file"
        value={filter.dataSetIds}
        setValue={(newIds) =>
          setFilter({
            ...filter,
            dataSetIds: newIds,
          })
        }
      />
      <ByAssetFilter
        value={filter.assetSubtreeIds?.map((el) => (el as InternalId).id)}
        setValue={(newValue) =>
          setFilter({
            ...filter,
            assetSubtreeIds: newValue?.map((id) => ({ id })),
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
      <LabelFilter
        resourceType="file"
        value={((filter as any).labels || { containsAny: [] }).containsAny}
        setValue={(newFilters) =>
          setFilter({
            ...filter,
            labels: newFilters ? { containsAny: newFilters } : undefined,
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
    </div>
  );
};
