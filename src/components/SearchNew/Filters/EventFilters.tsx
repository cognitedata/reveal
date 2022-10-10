import React from 'react';

import { EventFilter, InternalId } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { AggregatedFilterV2 } from './AggregatedFilter/AggregatedFilter';
import { AggregatedEventFilterV2 } from './AggregatedEventFilter/AggregatedEventFilter';
import { ByAssetFilterV2 } from './ByAssetFilter/ByAssetFilter';
import { DateFilterV2 } from './DateFilter/DateFilter';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';

export const EventFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: EventFilter;
  setFilter: (newFilter: EventFilter) => void;
}) => {
  const { data: items = [] } = useList('events', { filter, limit: 1000 });

  return (
    <BaseFilterCollapse.Panel title="Events" {...rest}>
      <AggregatedEventFilterV2
        field="type"
        filter={filter}
        setValue={newValue => {
          setFilter({ ...filter, type: newValue });
        }}
        title="Type"
        value={filter.type}
      />
      <DateFilterV2
        title="Start Time"
        value={filter.startTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            startTime: newDate || undefined,
          })
        }
      />
      <DateFilterV2
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
      <AggregatedEventFilterV2
        field="subtype"
        filter={filter}
        setValue={newValue => {
          setFilter({ ...filter, subtype: newValue });
        }}
        title="Sub-type"
        value={filter.subtype}
      />
      <ByAssetFilterV2
        value={filter.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newValue =>
          setFilter({
            ...filter,
            assetSubtreeIds: newValue?.map(id => ({ id })),
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
    </BaseFilterCollapse.Panel>
  );
};
