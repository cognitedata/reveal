import React from 'react';

import { BaseFilterCollapse } from '@data-exploration/components';

import { useList } from '@cognite/sdk-react-query-hooks';

import {
  FilterResourceType,
  InternalFilesFilters,
} from '@data-exploration-lib/core';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';

import { AggregatedFilterV2 } from './AggregatedFilter/AggregatedFilter';
import { DateFilterV2 } from './DateFilter/DateFilter';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
import { LabelFilterV2 } from './OldLabelFilter/OldLabelFilter';
import { StringFilterV2 } from './StringFilter/StringFilter';

export const OldFileFilters = ({
  filter,
  setFilter,
  onResetFilterClick,
  ...rest
}: {
  filter: InternalFilesFilters;
  setFilter: (newFilter: InternalFilesFilters) => void;
  onResetFilterClick: (resourceType: FilterResourceType) => void;
}) => {
  const { data: items = [] } = useList<any>('files', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel
      title="Files"
      {...rest}
      onResetClick={() => {
        onResetFilterClick('file');
      }}
    >
      <AggregatedFilterV2
        items={items}
        aggregator="mimeType"
        title="Mime type"
        value={filter.mimeType}
        setValue={(newValue) => setFilter({ ...filter, mimeType: newValue })}
      />

      <DateFilterV2
        title="Source Modified Time"
        value={filter.sourceModifiedTime}
        setValue={(newDate) =>
          setFilter({
            ...filter,
            sourceModifiedTime: newDate || undefined,
          })
        }
      />
      <LabelFilterV2
        resourceType="file"
        value={filter.labels}
        setValue={(newFilters) =>
          setFilter({
            ...filter,
            labels: newFilters,
          })
        }
      />

      <DateFilterV2
        title="Uploaded Time"
        value={filter.uploadedTime}
        setValue={(newDate) =>
          setFilter({
            ...filter,
            uploadedTime: newDate || undefined,
          })
        }
      />
      <StringFilterV2
        title="Directory prefix"
        value={(filter as any).directoryPrefix}
        setValue={(newPrefix) =>
          setFilter({
            ...filter,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
        setValue={(newSource) =>
          setFilter({
            ...filter,
            source: newSource,
          })
        }
      />
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={(newMetadata) =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
      />

      <DateFilterV2
        title="Source Created Time"
        value={filter.sourceCreatedTime}
        setValue={(newDate) =>
          setFilter({
            ...filter,
            sourceCreatedTime: newDate || undefined,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
