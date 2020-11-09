import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { useResourceFilter } from 'lib/context';

import { EventSubTypeFilter, EventTypeFilter } from 'lib/containers/Events';
import { SourceFilter } from './SourceFilter/SourceFilter';
import { MetadataFilter } from './MetadataFilter/MetadataFilter';
import { DataSetFilter } from './DataSetFilter/DataSetFilter';
import { ExternalIDPrefixFilter } from './ExternalIDPrefixFilter/ExternalIDPrefixFilter';
import { ByAssetFilter } from './ByAssetFilter/ByAssetFilter';

export default function EventFilters() {
  const filter = useResourceFilter('event');
  const { data: items = [] } = useList('events', { filter, limit: 1000 });
  return (
    <div>
      <DataSetFilter resourceType="event" />
      <EventTypeFilter items={items} />
      <EventSubTypeFilter items={items} />
      <ByAssetFilter resourceType="event" />
      <ExternalIDPrefixFilter resourceType="event" />
      <SourceFilter resourceType="event" items={items} />
      <MetadataFilter resourceType="event" items={items} />
    </div>
  );
}
