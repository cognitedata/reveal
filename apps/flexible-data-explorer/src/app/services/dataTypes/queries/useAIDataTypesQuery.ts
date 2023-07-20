import { useQuery } from '@tanstack/react-query';

import { useFDM } from '../../../providers/FDMProvider';
import { queryKeys } from '../../queryKeys';

export const useAIDataTypesQuery = (
  dataModel?: { externalId: string; space: string; version: string },
  query: string = '',
  variables = {}
) => {
  const client = useFDM();

  return useQuery(
    queryKeys.aiSearchDataTypes(query, variables, dataModel),
    async () => {
      const results = await client.aiSearch(dataModel, query, variables);

      return results;
    },
    {
      enabled: !!query && !!dataModel,
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};
