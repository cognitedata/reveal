import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useGetSuggestImprovementsJob = (jobId: string | undefined) => {
  const sdk = useSDK();

  const fetchJob = async () => {
    const response = await sdk.get(
      `/api/v1/projects/${sdk.project}/advancedjoins/suggestimprovements/${jobId}`,
      {
        headers: {
          'cdf-version': 'alpha',
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  };

  return useQuery({
    queryKey: ['advancedjoins', 'suggestimprovements', jobId],
    queryFn: fetchJob,
    enabled: !!jobId && jobId !== '',
    cacheTime: 0,
  });
};
