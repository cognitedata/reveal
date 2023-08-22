// import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';

export const useGetSuggestImprovementsJob = (jobId: string | undefined) => {
  // const sdk = useSDK();

  const fetchJob = async () => {
    const response = await fetch(
      // `https://localhost:8443/api/v1/projects/${sdk.project}/context/advancedjoins/suggestimprovements/${jobId}`,
      `https://localhost:8443/api/v1/projects/contextualization/context/advancedjoins/suggestimprovements/${jobId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.json();
  };

  return useQuery({
    queryKey: ['context', 'advancedjoins', 'suggestimprovements', jobId],
    queryFn: fetchJob,
    enabled: !!jobId && jobId !== '',
    cacheTime: 0,
  });
};
