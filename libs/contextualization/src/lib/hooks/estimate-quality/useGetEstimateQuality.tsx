import { useQuery } from '@tanstack/react-query';

export const useGetEstimateQuality = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['context', 'advancedjoins', 'estimatequality', jobId],
    queryFn: async () => {
      const response = await fetch(
        `https://localhost:8443/api/v1/projects/contextualization/advancedjoins/estimatequality/${jobId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.json();
    },
    enabled: false,
  });
};
