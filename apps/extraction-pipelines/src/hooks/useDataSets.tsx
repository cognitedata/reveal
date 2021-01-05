import { IdEither } from '@cognite/sdk';
import { QueryFunctionContext, useQuery } from 'react-query';
import { getDataSets } from '../utils/IntegrationsAPI';

export const useDataSets = (dataSetIds: IdEither[]) => {
  return useQuery(
    dataSetIds,
    (ctx: QueryFunctionContext<IdEither[]>) => {
      return getDataSets(ctx.queryKey);
    },
    {
      enabled: dataSetIds.length > 0,
    }
  );
};
