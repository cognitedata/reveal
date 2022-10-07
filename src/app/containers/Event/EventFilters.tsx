import React from 'react';

import { useList } from '@cognite/sdk-react-query-hooks';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { useEventsFilters, useResetEventsFilters } from 'app/store/filter';
import {
  AggregatedEventFilter,
  AggregatedFilter,
  DateFilter,
  MetadataFilter,
} from '@cognite/data-exploration';

export const EventFilters = ({ ...rest }: {}) => {
  const [eventFilter, setEventFilter] = useEventsFilters();
  const resetEventFilters = useResetEventsFilters();

  const { data: items = [] } = useList('events', {
    filter: eventFilter,
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel
      title="Events"
      onResetClick={resetEventFilters}
      {...rest}
    >
      <AggregatedEventFilter
        field="type"
        filter={eventFilter}
        setValue={newValue => {
          setEventFilter({ type: newValue });
        }}
        title="Type"
        value={eventFilter.type}
      />
      <DateFilter
        title="Start Time"
        value={eventFilter.startTime}
        setValue={newDate =>
          setEventFilter({
            startTime: newDate || undefined,
          })
        }
      />
      <DateFilter
        title="End Time"
        enableNull
        value={
          eventFilter.endTime && 'isNull' in eventFilter.endTime
            ? null
            : eventFilter.endTime
        }
        setValue={newDate =>
          setEventFilter({
            endTime: newDate === null ? { isNull: true } : newDate || undefined,
          })
        }
      />
      <AggregatedEventFilter
        field="subtype"
        filter={eventFilter}
        setValue={newValue => {
          setEventFilter({ subtype: newValue });
        }}
        title="Sub-type"
        value={eventFilter.subtype}
      />
      {/* <ByAssetFilter
        value={eventF.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newValue =>
          setFilter({
            ...filter,
            assetSubtreeIds: newValue?.map(id => ({ id })),
          })
        }
      /> */}
      <AggregatedFilter
        title="Source"
        items={items}
        aggregator="source"
        value={eventFilter.source}
        setValue={newSource =>
          setEventFilter({
            source: newSource,
          })
        }
      />
      <MetadataFilter
        items={items}
        value={eventFilter.metadata}
        setValue={newMetadata =>
          setEventFilter({
            metadata: newMetadata,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
