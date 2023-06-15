import { BASE_QUERY_KEY } from '@extraction-pipelines/utils/constants';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { DataSet } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const getDataSetListQueryKey = () => [BASE_QUERY_KEY, 'dataset-list'];

export const useDataSetList = (
  options?: UseQueryOptions<DataSet[], unknown, DataSet[], string[]>
) => {
  return useQuery<DataSet[], unknown, DataSet[], string[]>(
    getDataSetListQueryKey(),
    () => sdk.datasets.list().autoPagingToArray({ limit: -1 }),
    options
  );
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
