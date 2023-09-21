import { QueryClient } from '@tanstack/react-query';

import {
  CogniteClient,
  CogniteError,
  EventFilter,
} from '@cognite/sdk/dist/src';

import { AdvancedFilter } from '../../../builders';
import { EventsProperties, InternalEventsData } from '../../../events';
import { queryKeys } from '../../../queryKeys';
import { InternalSortBy } from '../../../types';

import { getImage360EventsBySiteId } from './getImage360EventsBySiteId';

export const fetchImage360BySiteId = async (
  sdk: CogniteClient,
  queryClient: QueryClient,
  siteId: string,
  {
    filter,
    limit,
    sort,
  }: {
    advancedFilter?: AdvancedFilter<EventsProperties>;
    filter?: EventFilter;
    cursor?: string;
    limit?: number;
    sort?: InternalSortBy[];
  },
  options?: any
) => {
  const createdTimeEventList = queryClient.fetchQuery<
    InternalEventsData[],
    CogniteError,
    InternalEventsData[]
  >(
    queryKeys.eventsBySiteId(siteId, {
      sort: [...(sort || []), { property: ['createdTime'], order: 'asc' }],
    }),
    () =>
      getImage360EventsBySiteId(sdk, siteId, {
        filter,
        limit,
        sort: [...(sort || []), { property: ['createdTime'], order: 'asc' }],
      }),
    options
  );

  const lastUpdatedTimeEventList = queryClient.fetchQuery<
    InternalEventsData[],
    CogniteError,
    InternalEventsData[]
  >(
    queryKeys.eventsBySiteId(siteId, {
      sort: [...(sort || []), { property: ['lastUpdatedTime'], order: 'desc' }],
    }),
    () =>
      getImage360EventsBySiteId(sdk, siteId, {
        filter,
        limit,
        sort: [
          ...(sort || []),
          { property: ['lastUpdatedTime'], order: 'desc' },
        ],
      }),
    options
  );

  const allQueries = await Promise.allSettled([
    createdTimeEventList,
    lastUpdatedTimeEventList,
  ]);

  const firstEventsFromSettledPromise = (
    allQueries.find((promise) =>
      isFulfilled(promise)
    ) as PromiseFulfilledResult<any>
  )?.value;

  return {
    id: siteId,
    siteId,
    name: firstEventsFromSettledPromise?.[0]?.metadata['site_name'] ?? '',
    createdTime: isFulfilled(allQueries[0])
      ? new Date(allQueries[0].value[0].createdTime)
      : undefined,
    lastUpdatedTime: isFulfilled(allQueries[1])
      ? new Date(allQueries[1].value[0].lastUpdatedTime)
      : undefined,
  };
};

const isFulfilled = <T>(
  input: PromiseSettledResult<T>
): input is PromiseFulfilledResult<T> => input.status === 'fulfilled';
