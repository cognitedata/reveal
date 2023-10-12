import { useQuery, UseQueryResult, QueryKey } from '@tanstack/react-query';

import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { TABLE_ITEMS_PER_PAGE } from '../common/constants';
import {
  API,
  RawAsset,
  RawCogniteEvent,
  RawFileInfo,
  RawTimeseries,
} from '../types/api';

import { getSearch, ListParams } from './api';

type UseQParam = Pick<ListParams, 'advancedFilter' | 'filter' | 'limit'>;

const getUseSearchKey = (api: API, q: any, opts: UseQParam): QueryKey => [
  api,
  'search',
  q,
  opts,
];

type Opts = {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  staleTime?: number;
};

export function useSearch(
  api: 'events',
  query: any,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseQueryResult<RawCogniteEvent[], CogniteError>;

export function useSearch(
  api: 'assets',
  query: any,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseQueryResult<RawAsset[], CogniteError>;

export function useSearch(
  api: 'timeseries',
  query: any,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseQueryResult<RawTimeseries[], CogniteError>;

export function useSearch(
  api: 'files',
  query: any,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
): UseQueryResult<RawFileInfo[], CogniteError>;

export function useSearch(
  api: API,
  query: any,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
):
  | UseQueryResult<RawTimeseries[], CogniteError>
  | UseQueryResult<RawCogniteEvent[], CogniteError>
  | UseQueryResult<RawAsset[], CogniteError>
  | UseQueryResult<RawFileInfo[], CogniteError>;

export function useSearch(
  api: API,
  query: any,
  { limit = TABLE_ITEMS_PER_PAGE, advancedFilter, filter }: UseQParam,
  opts?: Opts
):
  | UseQueryResult<RawTimeseries[], CogniteError>
  | UseQueryResult<RawCogniteEvent[], CogniteError>
  | UseQueryResult<RawAsset[], CogniteError>
  | UseQueryResult<RawFileInfo[], CogniteError> {
  const sdk = useSDK();
  return useQuery(
    getUseSearchKey(api, query, { limit, filter, advancedFilter }),
    async () => {
      return getSearch(sdk, api, query, { filter, limit }).then((r) => r.items);
    },
    opts
  );
}
