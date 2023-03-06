import { CogniteClient, CogniteError, TimeseriesFilter } from '@cognite/sdk';
import { TABLE_ITEMS_PER_PAGE } from 'common/constants';
import { downcaseMetadata } from 'utils';

import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  QueryKey,
} from '@tanstack/react-query';
import { useSDK } from '@cognite/sdk-provider';
import { range } from 'lodash-es';
import { RawCogniteEvent, RawTimeseries } from 'types/api';

type ListParams = {
  cursor?: string;
  filter?: TimeseriesFilter;
  advancedFilter?: any;
  partition?: string;
  limit?: number;
};

type UseQParam = Pick<ListParams, 'advancedFilter' | 'filter' | 'limit'>;
type API = 'timeseries' | 'events';

type PartitionCount = number;
const getUseListKey = (
  api: API,
  partitions: PartitionCount,
  opts: UseQParam
): QueryKey => [api, partitions, 'list', opts];

const getList = (
  sdk: CogniteClient,
  api: API,
  { cursor, filter, advancedFilter, partition, limit }: ListParams
) => {
  return sdk
    .post<{
      items: RawTimeseries[] | RawCogniteEvent[];
      nextCursor?: string;
    }>(`/api/v1/projects/${sdk.project}/${api}/list`, {
      headers: {
        'cdf-version': 'alpha',
      },
      data: {
        cursor,
        filter,
        advancedFilter,
        partition,
        limit,
      },
    })
    .then((r) => {
      if (r.status === 200) {
        return {
          nextCursor: r.data.nextCursor,
          items: r.data.items.map((item) => {
            return {
              ...item,
              // this will downcase all metadata keys. this is done since metadata aggreagates
              // are downcased server side and metadata fitlers are case insensitive
              metadata: downcaseMetadata(item.metadata),
            };
          }),
        };
      } else {
        return Promise.reject(r);
      }
    });
};

type Opts = {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  staleTime?: number;
};

export function useList(
  api: 'events',
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseInfiniteQueryResult<
  { items: RawCogniteEvent[]; cursors?: (string | undefined)[] },
  CogniteError
>;

export function useList(
  api: 'timeseries',
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseInfiniteQueryResult<
  { items: RawTimeseries[]; cursors?: (string | undefined)[] },
  CogniteError
>;
export function useList(
  api: API,
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
):
  | UseInfiniteQueryResult<
      { items: RawTimeseries[]; cursors?: (string | undefined)[] },
      CogniteError
    >
  | UseInfiniteQueryResult<
      { items: RawCogniteEvent[]; cursors?: (string | undefined)[] },
      CogniteError
    >;

export function useList(
  api: API,
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
):
  | UseInfiniteQueryResult<
      { items: RawTimeseries[]; cursors?: (string | undefined)[] },
      CogniteError
    >
  | UseInfiniteQueryResult<
      { items: RawCogniteEvent[]; cursors?: (string | undefined)[] },
      CogniteError
    > {
  const sdk = useSDK();
  return useInfiniteQuery(
    getUseListKey(api, partitions, { limit, filter, advancedFilter }),
    async ({ pageParam }) => {
      const partitionResults = await Promise.all(
        range(partitions).map((i) => {
          if (Array.isArray(pageParam)) {
            if (!pageParam[i]) {
              return Promise.resolve({ items: [], nextCursor: undefined });
            } else {
              return getList(sdk, api, {
                cursor: pageParam[i],
                filter,
                advancedFilter,
                limit: limit / partitions,
                partition: `${i + 1}/${partitions}`,
              });
            }
          } else {
            return getList(sdk, api, {
              filter,
              advancedFilter,
              limit: limit / partitions,
              partition: `${i + 1}/${partitions}`,
            });
          }
        })
      );
      return {
        items: partitionResults.reduce(
          (accl: any[], p) => [...accl, ...p.items],
          []
        ),
        cursors: partitionResults.reduce(
          (accl: (string | undefined)[], p) => [...accl, p.nextCursor],
          []
        ),
      };
    },
    {
      getNextPageParam(lastPage) {
        if (lastPage.cursors.filter(Boolean).length > 0) {
          return lastPage.cursors;
        }
      },
      ...opts,
    }
  );
}
