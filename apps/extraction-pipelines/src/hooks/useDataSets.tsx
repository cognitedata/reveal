import { DataSet, IdEither } from '@cognite/sdk';
import { useQuery, UseQueryOptions } from 'react-query';
import { SDKError } from 'model/SDKErrors';
import { DataSetModel } from 'model/DataSetModel';
import { getDataSets } from 'utils/DataSetAPI';
import { useSDK } from '@cognite/sdk-provider';

export const useDataSets = (dataSetIds: IdEither[]) => {
  const sdk = useSDK();
  return useQuery<DataSetModel[], SDKError>(
    ['data-sets', dataSetIds],
    () => {
      return getDataSets(sdk, dataSetIds);
    },
    {
      enabled: dataSetIds.length > 0,
    }
  );
};

export const useDataSet = (
  dataSetId?: number,
  options?: UseQueryOptions<DataSet, number | undefined>
) => {
  const sdk = useSDK();
  return useQuery<DataSet, number | undefined>(
    ['dataset', [{ id: dataSetId ?? 0 }]],
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
      enabled: !!dataSetId && options?.enabled,
    }
  );
};
