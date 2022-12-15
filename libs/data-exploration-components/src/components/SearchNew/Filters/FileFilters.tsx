import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { LabelFilterV2 } from './LabelFilter/LabelFilter';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
import { AggregatedFilterV2 } from './AggregatedFilter/AggregatedFilter';
import { StringFilterV2 } from './StringFilter/StringFilter';
import { DateFilterV2 } from './DateFilter/DateFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';
import { InternalFilesFilters } from 'domain/files';
import { transformNewFilterToOldFilter } from 'domain/transformers';

export const FileFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: InternalFilesFilters;
  setFilter: (newFilter: InternalFilesFilters) => void;
}) => {
  const { data: items = [] } = useList('files', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel title="Files" {...rest}>
      <AggregatedFilterV2
        items={items}
        aggregator="mimeType"
        title="Mime type"
        value={filter.mimeType}
        setValue={newValue => setFilter({ ...filter, mimeType: newValue })}
      />
      <DateFilterV2
        title="Source Modified Time"
        value={filter.sourceModifiedTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            sourceModifiedTime: newDate || undefined,
          })
        }
      />
      <LabelFilterV2
        resourceType="file"
        value={filter.labels}
        setValue={newFilters =>
          setFilter({
            ...filter,
            labels: newFilters,
          })
        }
      />

      <DateFilterV2
        title="Uploaded Time"
        value={filter.uploadedTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            uploadedTime: newDate || undefined,
          })
        }
      />
      <StringFilterV2
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
        value={filter.metadata}
        setValue={newMetadata =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
      />

      <DateFilterV2
        title="Source Created Time"
        value={filter.sourceCreatedTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            sourceCreatedTime: newDate || undefined,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
