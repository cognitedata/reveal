import { CogniteError } from '@cognite/sdk';
import { TABLE_ITEMS_PER_PAGE } from 'common/constants';

import { useQuery, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { useSDK } from '@cognite/sdk-provider';
import { API, RawAsset, RawCogniteEvent, RawTimeseries } from 'types/api';
import { getList, ListParams } from './api';

type UseQParam = Pick<ListParams, 'advancedFilter' | 'filter' | 'limit'>;

type PartitionCount = number;
const getUseListKey = (
  api: API,
  partitions: PartitionCount,
  opts: UseQParam
): QueryKey => [api, partitions, 'list', opts];

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
): UseQueryResult<RawCogniteEvent[], CogniteError>;

export function useList(
  api: 'timeseries',
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseQueryResult<RawTimeseries[], CogniteError>;
export function useList(
  api: API,
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
):
  | UseQueryResult<RawTimeseries[], CogniteError>
  | UseQueryResult<RawCogniteEvent[], CogniteError>;

export function useList(
  api: API,
  partitions: PartitionCount,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
):
  | UseQueryResult<RawTimeseries[], CogniteError>
  | UseQueryResult<RawCogniteEvent[], CogniteError> {
  const sdk = useSDK();
  return useQuery(
    getUseListKey(api, partitions, { limit, filter, advancedFilter }),
    async () => {
      return getList(sdk, api, {
        filter,
        advancedFilter,
        limit,
      }).then((r) => r.items);
    },
    opts
  );
}
