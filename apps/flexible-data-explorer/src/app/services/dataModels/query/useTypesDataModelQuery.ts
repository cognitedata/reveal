import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { BaseFDMClient } from '../../FDMClientV2';
import { queryKeys } from '../../queryKeys';
import { DataModelByIdResponse } from '../../types';
import { useSelectedDataModels } from '../../useSelectedDataModels';

export const useTypesDataModelsQuery = () => {
  const sdk = useSDK();
  const client = new BaseFDMClient(sdk);

  const dataModels = useSelectedDataModels();

  const results = useQueries({
    queries: (dataModels || []).map((dataModel) => {
      return {
        queryKey: queryKeys.dataModelTypesV2(dataModel),
        queryFn: async () => {
          const model = await client.getDataModelById(dataModel);
          return model;
        },
        staleTime: Infinity,
        cacheTime: Infinity,
      };
    }),
  });

  const normalizeResults = useMemo(
    () => ({
      isLoading: results.some((item) => item.isLoading),
      data: results?.reduce((acc, item) => {
        if (item.data) {
          return [...acc, item.data];
        }

        return acc;
      }, [] as DataModelByIdResponse[]),
    }),
    [results]
  );

  return normalizeResults;
};
