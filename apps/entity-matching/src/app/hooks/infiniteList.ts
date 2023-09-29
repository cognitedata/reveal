import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  QueryKey,
} from '@tanstack/react-query';
import { range } from 'lodash-es';

import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { TABLE_ITEMS_PER_PAGE } from '../common/constants';
import {
  API,
  RawAsset,
  RawCogniteEvent,
  RawFileInfo,
  RawSequence,
  RawTimeseries,
} from '../types/api';

import { getList, ListParams } from './api';

type UseQParam = Pick<ListParams, 'advancedFilter' | 'filter' | 'limit'>;

type PartitionCount = number;
const getUseListKey = (
  api: API,
  partitions: PartitionCount,
  opts: UseQParam
): QueryKey => [api, partitions, 'infinite-list', opts];

type Opts = {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  staleTime?: number;
};

// Avoid refetching large amounts of data
export const INFINITE_Q_OPTIONS = {
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

export function useInfiniteList(
  api: 'events',
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseInfiniteQueryResult<
  { items: RawCogniteEvent[]; cursors?: (string | undefined)[] },
  CogniteError
>;

export function useInfiniteList(
  api: 'sequences',
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseInfiniteQueryResult<
  { items: RawSequence[]; cursors?: (string | undefined)[] },
  CogniteError
>;

export function useInfiniteList(
  api: 'assets',
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseInfiniteQueryResult<
  { items: RawAsset[]; cursors?: (string | undefined)[] },
  CogniteError
>;

export function useInfiniteList(
  api: 'timeseries',
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseInfiniteQueryResult<
  { items: RawTimeseries[]; cursors?: (string | undefined)[] },
  CogniteError
>;

export function useInfiniteList(
  api: 'files',
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseInfiniteQueryResult<
  { items: RawFileInfo[]; cursors?: (string | undefined)[] },
  CogniteError
>;

export function useInfiniteList(
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
    >
  | UseInfiniteQueryResult<
      { items: RawFileInfo[]; cursors?: (string | undefined)[] },
      CogniteError
    >
  | UseInfiniteQueryResult<
      { items: RawSequence[]; cursors?: (string | undefined)[] },
      CogniteError
    >;

export function useInfiniteList(
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
    >
  | UseInfiniteQueryResult<
      { items: RawFileInfo[]; cursors?: (string | undefined)[] },
      CogniteError
    >
  | UseInfiniteQueryResult<
      { items: RawSequence[]; cursors?: (string | undefined)[] },
      CogniteError
    > {
  const sdk = useSDK();
  return useInfiniteQuery(
    getUseListKey(api, partitions, { limit, filter, advancedFilter }),
    async ({ pageParam }) => {
      const partitionResults = await Promise.all(
        range(partitions).map((i: number) => {
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
          (accl: any[], p: any) => [...accl, ...p.items],
          []
        ),
        cursors: partitionResults.reduce(
          (accl: (string | undefined)[], p: any) => [...accl, p.nextCursor],
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
