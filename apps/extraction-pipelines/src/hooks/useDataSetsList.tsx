import { useQuery } from 'react-query';
import { DataSet, ListResponse } from '@cognite/sdk';
import { SDKError } from '../model/SDKErrors';
import { getDataSetsList } from '../utils/DataSetAPI';

export const useDataSetsList = (limit?: number) => {
  return useQuery<ListResponse<DataSet[]>, SDKError>('data-set-list', () => {
    return getDataSetsList(limit);
  });
};
