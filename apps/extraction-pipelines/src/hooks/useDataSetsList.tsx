import { useQuery } from 'react-query';
import { DataSet } from '@cognite/sdk';
import { SDKError } from 'model/SDKErrors';
import { getDataSetsList } from 'utils/DataSetAPI';

export const useDataSetsList = (limit?: number) => {
  return useQuery<DataSet[], SDKError>('data-set-list', () => {
    return getDataSetsList(limit);
  });
};
