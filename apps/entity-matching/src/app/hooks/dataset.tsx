import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { DataSet } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

export const getDataSetListQueryKey = () => ['quickmatch', 'dataset-list'];

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
