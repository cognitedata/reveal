import { IdEither } from '@cognite/sdk';
import { useQuery } from 'react-query';
import { DataSetError, SDKError } from 'model/SDKErrors';
import { DataSetModel } from 'model/DataSetModel';
import { getDataSets } from 'utils/DataSetAPI';
import { useSDK } from '@cognite/sdk-provider'; // eslint-disable-line

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

export const useDataSet = (dataSetId?: number, retry?: number) => {
  const sdk = useSDK();
  return useQuery<DataSetModel[], DataSetError>(
    ['dataset', [{ id: dataSetId }]],
    () => {
      return getDataSets(sdk, [...(dataSetId ? [{ id: dataSetId }] : [])]);
    },
    {
      enabled: !!dataSetId,
      retry,
    }
  );
};
