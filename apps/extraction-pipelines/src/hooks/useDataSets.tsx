import { IdEither } from '@cognite/sdk';
import { QueryFunctionContext, useQuery } from 'react-query';
import { getDataSets } from '../utils/IntegrationsAPI';
import { SDKError } from '../model/SDKErrors';
import { DataSetModel } from '../model/DataSetModel';

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
