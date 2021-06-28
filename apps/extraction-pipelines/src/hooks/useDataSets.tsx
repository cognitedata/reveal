import { IdEither } from '@cognite/sdk';
import { useQuery } from 'react-query';
import { DataSetError, SDKError } from 'model/SDKErrors';
import { DataSetModel } from 'model/DataSetModel';
import { getDataSets } from 'utils/DataSetAPI';

export const useDataSets = (dataSetIds: IdEither[]) => {
  return useQuery<DataSetModel[], SDKError>(
    ['data-sets', dataSetIds],
    () => {
      return getDataSets(dataSetIds);
    },
    {
      enabled: dataSetIds.length > 0,
    }
  );
};

export const useDataSet = (dataSetId?: number, retry?: number) => {
  return useQuery<DataSetModel[], DataSetError>(
    ['dataset', [{ id: dataSetId }]],
    () => {
      return getDataSets([...(dataSetId ? [{ id: dataSetId }] : [])]);
    },
    {
      enabled: !!dataSetId,
      retry,
    }
  );
};
