import { useQuery } from '@tanstack/react-query';

export const useCreateMeasureMappedPercentages = (
  space: string,
  viewExternalId?: string,
  viewVersion?: string
) => {
  return useQuery({
    queryKey: [
      'context',
      'advancedjoins',
      'measuremappedpercentage',
      space,
      viewExternalId,
      viewVersion,
    ],
    queryFn: async () => {
      const response = await fetch(
        `https://localhost:8443/api/v1/projects/contextualization/advancedjoins/measuremappedpercentage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            space: space,
            viewExternalId: viewExternalId,
            viewVersion: viewVersion,
          }),
        }
      );

      return response.json();
    },
    enabled: !!viewExternalId && !!viewVersion,
  });
};
