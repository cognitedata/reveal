import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { FileFilterProps } from '@cognite/sdk';
import { LabelFilter } from './LabelFilter/LabelFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';

export const FileFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: FileFilterProps;
  setFilter: (newFilter: FileFilterProps) => void;
}) => {
  const { data: items = [] } = useList('files', { filter, limit: 1000 });

  return (
    <BaseFilterCollapse.Panel title="Files" {...rest}>
      <AggregatedFilter
        items={items}
        aggregator="mimeType"
        title="Mime type"
        value={filter.mimeType}
        setValue={newValue => setFilter({ ...filter, mimeType: newValue })}
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
