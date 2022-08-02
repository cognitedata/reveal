import React from 'react';

import { EventFilter, InternalId } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { useAggregatedEventFilter } from 'hooks/useAggregatedEventFilter';
import { ResetFiltersButton } from './ResetFiltersButton';
import { AggregatedFilter } from './AggregatedFilter/AggregatedFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { DateFilter } from './DateFilter/DateFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { StringFilter } from './StringFilter/StringFilter';
import { AdvancedFiltersCollapse } from './AdvancedFiltersCollapse';

export const EventFilters = ({
  filter,
  setFilter,
}: {
  filter: EventFilter;
  setFilter: (newFilter: EventFilter) => void;
}) => {
  const { data: items = [] } = useList('events', { filter, limit: 1000 });

  const typeFilter = useAggregatedEventFilter({
    field: 'type',
    filter,
    onUpdate: newValue => setFilter({ ...filter, type: newValue }),
    title: 'Type',
    value: filter.type,
  });
  const subtypeFilter = useAggregatedEventFilter({
    field: 'subtype',
    filter,
    onUpdate: newValue => setFilter({ ...filter, subtype: newValue }),
    title: 'Sub-type',
    value: filter.subtype,
  });

  return (
    <div>
      <ResetFiltersButton setFilter={setFilter} />
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
      {typeFilter}
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
      <AdvancedFiltersCollapse resourceType="event" filter={filter}>
        {subtypeFilter}
        <ByAssetFilter
          value={filter.assetSubtreeIds?.map(el => (el as InternalId).id)}
          setValue={newValue =>
            setFilter({
              ...filter,
              assetSubtreeIds: newValue?.map(id => ({ id })),
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
      </AdvancedFiltersCollapse>
    </div>
  );
};
