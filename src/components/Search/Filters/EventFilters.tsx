import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { EventFilter, InternalId } from '@cognite/sdk';
import { StringFilter } from './StringFilter/StringFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { DateFilter } from './DateFilter/DateFilter';

export const EventFilters = ({
  filter,
  setFilter,
}: {
  filter: EventFilter;
  setFilter: (newFilter: EventFilter) => void;
}) => {
  const { data: items = [] } = useList('events', { filter, limit: 1000 });
  return (
    <div>
      <DataSetFilter
        resourceType="event"
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
        aggregator="type"
        title="Type"
        value={filter.type}
        setValue={newValue => setFilter({ ...filter, type: newValue })}
      />
      <AggregatedFilter
        items={items}
        aggregator="subtype"
        title="Sub-type"
        value={filter.subtype}
        setValue={newValue => setFilter({ ...filter, subtype: newValue })}
      />
      <DateFilter
        title="Start Time"
        value={filter.startTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            startTime: newDate || undefined,
          })
        }
      />
      <DateFilter
        title="End Time"
        enableNull
        value={
          filter.endTime && 'isNull' in filter.endTime ? null : filter.endTime
        }
        setValue={newDate =>
          setFilter({
            ...filter,
            endTime: newDate === null ? { isNull: true } : newDate || undefined,
          })
        }
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
    </div>
  );
};
