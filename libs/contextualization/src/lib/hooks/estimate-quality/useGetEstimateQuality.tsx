import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useGetEstimateQuality = (jobId: string | undefined) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['advancedjoins', 'estimatequality', jobId],
    queryFn: async () => {
      const response = await sdk.get(
        `/api/v1/projects/${sdk.project}/advancedjoins/estimatequality/${jobId}`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    enabled: false,
  });
};
