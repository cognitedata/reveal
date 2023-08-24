import { useQuery } from '@tanstack/react-query';

export const useGetMeasureMappedPercentages = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['context', 'advancedjoins', 'measuremappedpercentage', jobId],
    queryFn: async () => {
      const response = await fetch(
        `https://localhost:8443/api/v1/projects/contextualization/advancedjoins/measuremappedpercentage/${jobId}`,
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
