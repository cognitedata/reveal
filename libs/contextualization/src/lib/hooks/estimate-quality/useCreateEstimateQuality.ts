import { useQuery } from '@tanstack/react-query';

export const useCreateEstimateQuality = (
  advancedJoinExternalId: string,
  selectedDatabase: string,
  selectedTable: string,
  fromColumn: string | undefined,
  toColumn: string | undefined
) => {
  return useQuery({
    queryKey: [
      'context',
      'advancedjoins',
      'estimatequality',
      advancedJoinExternalId,
      selectedDatabase,
      selectedTable,
      fromColumn,
      toColumn,
    ],
    queryFn: async () => {
      const response = await fetch(
        `https://localhost:8443/api/v1/projects/contextualization/context/advancedjoins/estimatequality`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            advancedJoinExternalId: advancedJoinExternalId,
            matcher: {
              type: 'raw',
              dbName: selectedDatabase,
              tableName: selectedTable,
              fromColumnKey: fromColumn,
              toColumnKey: toColumn,
            },
          }),
        }
      );
      return response.json();
    },
    enabled: !!fromColumn && !!toColumn,
  });
};
