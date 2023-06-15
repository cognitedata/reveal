import { getDataSetsList } from '@extraction-pipelines/utils/DataSetAPI';
import { useQuery } from '@tanstack/react-query';

import { CogniteError, DataSet } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useDataSetsList = (limit?: number) => {
  const sdk = useSDK();
  return useQuery<DataSet[], CogniteError>(['data-set-list'], () => {
    return getDataSetsList(sdk, limit);
  });
};
