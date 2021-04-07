import { IdEither } from '@cognite/sdk';
import { QueryFunctionContext, useQuery } from 'react-query';
import { DataSetError, SDKError } from 'model/SDKErrors';
import { DataSetModel } from 'model/DataSetModel';
import { getDataSets } from 'utils/DataSetAPI';

export const useDataSets = (dataSetIds: IdEither[]) => {
  return useQuery<DataSetModel[], SDKError>(
    dataSetIds,
    (ctx: QueryFunctionContext<IdEither[]>) => {
      return getDataSets(ctx.queryKey);
    },
    {
      enabled: dataSetIds.length > 0,
    }
  );
};

export const useDataSet = (dataSetId?: number, retry?: number) => {
  return useQuery<DataSetModel[], DataSetError>(
    ['dataset', [{ id: dataSetId }]],
    (ctx) => {
      return getDataSets(ctx.queryKey[1]);
    },
    {
      enabled: !!dataSetId,
      retry,
    }
  );
};
