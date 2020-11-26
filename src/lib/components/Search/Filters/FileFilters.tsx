import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { FileFilterProps, InternalId } from '@cognite/sdk';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { BooleanFilter } from './BooleanFilter/BooleanFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { DateFilter } from './DateFilter/DateFilter';

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
      <LabelFilter
        resourceType="file"
        value={((filter as any).labels || { containsAny: [] }).containsAny}
        setValue={newFilters =>
          setFilter({
            ...filter,
            labels: newFilters ? { containsAny: newFilters } : undefined,
          })
        }
      />
      <DataSetFilter
        resourceType="file"
        value={filter.dataSetIds}
        setValue={newIds =>
          setFilter({
            ...filter,
            dataSetIds: newIds,
          })
        }
      />
      <AggregatedFilter
        items={items}
        aggregator="mimeType"
        title="Mime type"
        value={filter.mimeType}
        setValue={newValue => setFilter({ ...filter, mimeType: newValue })}
      />
      <ByAssetFilter
        value={filter.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newValue =>
          setFilter({
            ...filter,
            assetSubtreeIds: newValue?.map(id => ({ id })),
          })
        }
      />
      <BooleanFilter
        title="Is uploaded"
        value={filter.uploaded}
        setValue={newValue =>
          setFilter({
            ...filter,
            uploaded: newValue,
          })
        }
      />
      <DateFilter
        title="Uploaded Time"
        value={filter.uploadedTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            uploadedTime: newDate || undefined,
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
      <StringFilter
        title="Directory prefix"
        value={(filter as any).directoryPrefix}
        setValue={newPrefix =>
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
        setValue={newSource =>
          setFilter({
            ...filter,
            source: newSource,
          })
        }
      />
      <MetadataFilter
        items={items}
        value={filter.metadata}
        setValue={newMetadata =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
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
      <DateFilter
        title="Source Created Time"
        value={filter.sourceCreatedTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            sourceCreatedTime: newDate || undefined,
          })
        }
      />
      <DateFilter
        title="Source Modified Time"
        value={filter.sourceModifiedTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            sourceModifiedTime: newDate || undefined,
          })
        }
      />
    </div>
  );
};
