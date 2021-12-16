import { useQuery } from 'react-query';
import { DataSet } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider'; // eslint-disable-line
import { SDKError } from 'model/SDKErrors';
import { getDataSetsList } from 'utils/DataSetAPI';

export const useDataSetsList = (limit?: number) => {
  const sdk = useSDK();
  return useQuery<DataSet[], SDKError>('data-set-list', () => {
    return getDataSetsList(sdk, limit);
  });
};
