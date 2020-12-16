import { DataSet, IdEither } from '@cognite/sdk';
import { QueryResult, useQuery } from 'react-query';
import { getDataSets } from '../utils/IntegrationsAPI';
import { SDKDataSetsError } from '../model/SDKErrors';

export const useDataSets = (
  dataSetIds: IdEither[]
): QueryResult<DataSet[], SDKDataSetsError> => {
  return useQuery<DataSet[], SDKDataSetsError>([dataSetIds], getDataSets, {
    enabled: dataSetIds.length > 0,
  });
};
