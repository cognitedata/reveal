import { useMemo } from 'react';

import { BaseFDMClient } from '@fdx/shared/clients/FDMClientV2';
import { useSelectedDataModels } from '@fdx/shared/hooks/useSelectedDataModels';
import { DataModelByIdResponse } from '@fdx/shared/types/services';
import { useQueries } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../queryKeys';

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
          // Ignore data models without graphQlDml
          if (!item.data.graphQlDml) {
            return acc;
          }

          return [...acc, item.data];
        }

        return acc;
      }, [] as DataModelByIdResponse[]),
    }),
    [results]
  );

  return normalizeResults;
};
