import { CogniteClient, EventFilter } from '@cognite/sdk/dist/src';

import { AdvancedFilter } from '../../../builders';
import {
  EventsProperties,
  getEventsList,
  InternalEventsData,
} from '../../../events';
import { InternalSortBy } from '../../../types';

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
