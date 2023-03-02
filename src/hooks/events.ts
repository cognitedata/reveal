import {
  CogniteError,
  CogniteEvent,
  EventChange,
  EventFilter,
  CogniteClient,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  QueryClient,
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

import { TABLE_ITEMS_PER_PAGE } from 'common/constants';
import { PropertyAggregate, PropertyAggregateResponse } from 'common/types';
import { downcaseMetadata } from 'utils';

type EventsParams = {
  limit?: number;
  unmatchedOnly?: boolean;
  filter?: EventFilter;
};
const useEventsKey = (opts: EventsParams): QueryKey => ['events', 'list', opts];
const useEventsSearchKey = (
  description: string,
  filter?: EventFilter
): QueryKey => ['events', 'search', description, { filter }];

type RawEvent = CogniteEvent & {
  lastUpdatedTime: number;
  createdTime: number;
};

export const useEvents = (
  {
    limit = TABLE_ITEMS_PER_PAGE,
    unmatchedOnly: unmatched,
    filter,
  }: EventsParams,
  opts?: UseInfiniteQueryOptions<
    { items: RawEvent[]; nextPage?: string },
    CogniteError
  >
) => {
  const sdk = useSDK();
  sdk.events.list();
  return useInfiniteQuery(
    useEventsKey({ limit, filter, unmatchedOnly: unmatched }),
    ({ pageParam }) =>
      sdk
        .post<{ items: RawEvent[]; nextPage?: string }>(
          `/api/v1/projects/${sdk.project}/events/list`,
          {
            headers: {
              'cdf-version': 'alpha',
            },
            data: {
              cursor: pageParam,
              filter,
              advancedFilter: unmatched
                ? {
                    not: {
                      exists: {
                        property: ['assetId'],
                      },
                    },
                  }
                : undefined,
              limit,
            },
          }
        )
        .then((r) => {
          if (r.status === 200) {
            return {
              nextPage: r.data.nextPage,
              items: r.data.items.map((ts) => {
                return {
                  ...ts,
                  // this will downcase all metadata keys. this is done since metadata aggreagates
                  // are downcased server side and metadata fitlers are case insensitive
                  metadata: downcaseMetadata(ts.metadata),
                };
              }),
            };
          } else {
            return Promise.reject(r);
          }
        }),
    {
      getNextPageParam(lastPage) {
        return lastPage.nextPage;
      },
      ...opts,
    }
  );
};

export const useEventsSearch = <T>(
  description: string,
  opts?: UseQueryOptions<CogniteEvent[], CogniteError, T>
) => {
  const sdk = useSDK();
  return useQuery(
    useEventsSearchKey(description),
    () => sdk.events.search({ search: { description }, limit: 1000 }),

    opts
  );
};

export const useUpdateEvents = (
  options?: UseMutationOptions<CogniteEvent[], CogniteError, EventChange[]>
) => {
  const sdk = useSDK();

  return useMutation(
    ['update', 'events'],
    (changes) => {
      return sdk.events.update(changes);
    },
    options
  );
};

export const getPropertiesAggregateKey = (): QueryKey => [
  'events',
  'properties-aggregate',
];

/**
 * NOTE: metadata aggreates are always downcased since metadata filters are case-insensitive.
 */
export const getPropertiesAggregate = async (sdk: CogniteClient) => {
  const topLevelProperties: PropertyAggregate[] = [
    { values: [{ property: ['name'] }] },
    { values: [{ property: ['description'] }] },
    { values: [{ property: ['unit'] }] },
  ];
  return sdk
    .post<PropertyAggregateResponse>(
      `/api/v1/projects/${sdk.project}/events/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: { aggregate: 'uniqueProperties', path: ['metadata'] },
      }
    )
    .then((r) => {
      if (r.status === 200) {
        return [...topLevelProperties, ...r.data.items];
      } else {
        return Promise.reject(r);
      }
    });
};

export const fetchProperties = async (sdk: CogniteClient, qc: QueryClient) => {
  return qc.fetchQuery(getPropertiesAggregateKey(), () =>
    getPropertiesAggregate(sdk)
  );
};

export const useProperties = (
  options?: UseQueryOptions<PropertyAggregate[], CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getPropertiesAggregateKey(),
    () => getPropertiesAggregate(sdk),
    options
  );
};
