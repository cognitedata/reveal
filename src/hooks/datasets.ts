import { useSDK } from '@cognite/sdk-provider';
import { CogniteError, DataSet } from '@cognite/sdk';
import { QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query';

const useDataSetKey = (): QueryKey => ['datasets'];
export const useAllDataSets = <T>(
  options?: UseQueryOptions<DataSet[], CogniteError, T>
) => {
  const sdk = useSDK();

  return useQuery(
    useDataSetKey(),
    () => sdk.datasets.list({ limit: 1000 }).autoPagingToArray({ limit: -1 }),
    {
      staleTime: 60000,
      ...options,
    }
  );
};
