import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useCreateEstimateQuality = (
  advancedJoinExternalId: string,
  selectedDatabase: string,
  selectedTable: string,
  fromColumn: string | undefined,
  toColumn: string | undefined
) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: [
      'advancedjoins',
      'estimatequality',
      advancedJoinExternalId,
      selectedDatabase,
      selectedTable,
      fromColumn,
      toColumn,
    ],
    queryFn: async () => {
      const response = await sdk.post(
        `/api/v1/projects/${sdk.project}/advancedjoins/estimatequality`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
          data: {
            advancedJoinExternalId: advancedJoinExternalId,
            matcher: {
              type: 'raw',
              dbName: selectedDatabase,
              tableName: selectedTable,
              fromColumnKey: fromColumn,
              toColumnKey: toColumn,
            },
          },
        }
      );
      return response.data;
    },
    enabled: !!fromColumn && !!toColumn,
  });
};
