import { useQuery } from '@tanstack/react-query';
import { CogniteError, DataSet } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { getDataSetsList } from 'utils/DataSetAPI';

export const useDataSetsList = (limit?: number) => {
  const sdk = useSDK();
  return useQuery<DataSet[], CogniteError>(['data-set-list'], () => {
    return getDataSetsList(sdk, limit);
  });
};
