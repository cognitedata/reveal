import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useListMatches = () => {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['advancedjoins', 'matches'],
    queryFn: async () => {
      const response = await sdk.get(
        `/api/v1/projects/${sdk.project}/advancedjoins/matches`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
  });
};
