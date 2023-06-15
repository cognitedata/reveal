import { useEffect } from 'react';

import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { BASE_QUERY_KEY } from '@transformations/common';

import { CogniteError, DataSet, ListResponse } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const getDataSetListQueryKey = () => [BASE_QUERY_KEY, 'dataset-list'];

export const useDataSetList = (
  options?: UseInfiniteQueryOptions<
    ListResponse<DataSet[]>,
    CogniteError,
    ListResponse<DataSet[]>
  >
) => {
  const sdk = useSDK();

  const query = useInfiniteQuery<
    ListResponse<DataSet[]>,
    CogniteError,
    ListResponse<DataSet[]>
  >(
    getDataSetListQueryKey(),
    ({ pageParam = undefined }) =>
      sdk.datasets
        .list({ limit: 100, cursor: pageParam })
        .catch((e) => Promise.reject(e.errors?.[0] || e)),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      ...options,
    }
  );

  useEffect(() => {
    if (query.hasNextPage && !query.isFetching) {
      query.fetchNextPage();
    }
  }, [query]);

  return query;
};

export const useDataSet = (
  dataSetId?: number,
  options: UseQueryOptions<DataSet, number | undefined> = { enabled: true }
) => {
  const sdk = useSDK();
  return useQuery<DataSet, number | undefined>(
    [...getDataSetListQueryKey(), dataSetId ?? 0],
    () =>
      sdk.datasets
        .retrieve([{ id: dataSetId! }])
        .then((r) => r[0])
        .catch((err: any) => {
          const status: number | undefined = err?.errors[0]?.status;
          return Promise.reject(status);
        }),
    {
      ...options,
      enabled: !!dataSetId && options.enabled,
    }
  );
};
