import { IdEither } from '@cognite/sdk';
import { QueryFunctionContext, useQuery } from 'react-query';
import { SDKError } from '../model/SDKErrors';
import { DataSetModel } from '../model/DataSetModel';
import { getDataSets } from '../utils/DataSetAPI';

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
