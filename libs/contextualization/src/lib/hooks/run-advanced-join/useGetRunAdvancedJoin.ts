import { useQuery } from '@tanstack/react-query';

export const useGetRunAdvancedJoin = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['context', 'advancedjoins', 'run', jobId],
    queryFn: async () => {
      const response = await fetch(
        `https://localhost:8443/api/v1/projects/contextualization/context/advancedjoins/run/${jobId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.json();
    },
    enabled: !!jobId,
  });
};
