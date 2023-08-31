import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useListMatches = (advancedJoinExternalId?: string) => {
  const sdk = useSDK();

  const params = new URLSearchParams({
    advancedJoinExternalId: advancedJoinExternalId || '',
  });

  return useQuery({
    queryKey: ['advancedjoins', 'matches', advancedJoinExternalId],
    queryFn: async () => {
      const response = await sdk.get(
        `/api/v1/projects/${sdk.project}/advancedjoins/matches?${params}`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    enabled: !!advancedJoinExternalId,
  });
};
