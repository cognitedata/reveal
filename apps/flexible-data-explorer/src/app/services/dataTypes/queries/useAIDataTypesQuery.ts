import { useQuery } from '@tanstack/react-query';

import { useFDM } from '../../../providers/FDMProvider';
import { queryKeys } from '../../queryKeys';

export const useAIDataTypesQuery = (query: string = '', variables = {}) => {
  const client = useFDM();

  return useQuery(
    queryKeys.searchDataTypes(query, variables),
    async () => {
      const results = await client.aiSearch(query, variables);

      return results;
    },
    {
      enabled: !!query,
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};
