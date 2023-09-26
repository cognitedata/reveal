import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { DataSet } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { BASE_QUERY_KEY } from '../utils/constants';

export const getDataSetListQueryKey = () => [BASE_QUERY_KEY, 'dataset-list'];

export const useDataSetList = (
  options?: UseQueryOptions<DataSet[], unknown, DataSet[], string[]>
) => {
  const sdk = useSDK();
  return useQuery<DataSet[], unknown, DataSet[], string[]>(
    getDataSetListQueryKey(),
    () => sdk.datasets.list({ limit: 1000 }).autoPagingToArray({ limit: -1 }),
    options
  );
};

export const useDataSet = (
  dataSetId: number,
  options: UseQueryOptions<DataSet, number | undefined> = { enabled: true }
) => {
  const sdk = useSDK();
  return useQuery<DataSet, number | undefined>(
    [...getDataSetListQueryKey(), dataSetId ?? 0],
    () =>
      sdk.datasets
        .retrieve([{ id: dataSetId }])
        .then((r) => r[0])
        .catch((err: { errors: [{ status: number }] }) => {
          const status: number | undefined = err?.errors[0]?.status;
          return Promise.reject(status);
        }),
    {
      ...options,
      enabled: !!dataSetId && options.enabled,
    }
  );
};
