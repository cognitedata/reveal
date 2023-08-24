import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useGetRunAdvancedJoin = (jobId: string | undefined) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['advancedjoins', 'run', jobId],
    queryFn: async () => {
      const response = await sdk.get(
        `/api/v1/projects/${sdk.project}/advancedjoins/run/${jobId}`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    enabled: !!jobId,
  });
};
