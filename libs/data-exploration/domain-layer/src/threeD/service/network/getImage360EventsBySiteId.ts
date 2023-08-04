import { CogniteClient, EventFilter } from '@cognite/sdk/dist/src';

import {
  AdvancedFilter,
  EventsProperties,
  getEventsList,
  InternalEventsData,
  InternalSortBy,
} from '@data-exploration-lib/domain-layer';

export const getImage360EventsBySiteId = async (
  sdk: CogniteClient,
  siteId: string,
  {
    filter,
    limit = 1000,
    sort,
  }: {
    advancedFilter?: AdvancedFilter<EventsProperties>;
    filter?: EventFilter;
    cursor?: string;
    limit?: number;
    sort?: InternalSortBy[];
  }
) => {
  return getEventsList(sdk, {
    filter: {
      ...filter,
      metadata: {
        site_id: siteId,
      },
      type: 'scan',
    },
    sort: [...(sort || [])],
    limit,
  }).then((value: { items: InternalEventsData[] }) => value.items);
};
