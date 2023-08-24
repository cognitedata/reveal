import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useCreateMeasureMappedPercentages = (
  space: string,
  viewExternalId?: string,
  viewVersion?: string
) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: [
      'advancedjoins',
      'measuremappedpercentage',
      space,
      viewExternalId,
      viewVersion,
    ],
    queryFn: async () => {
      const response = await sdk.post(
        `/api/v1/projects/${sdk.project}/advancedjoins/measuremappedpercentage`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
          data: {
            space: space,
            viewExternalId: viewExternalId,
            viewVersion: viewVersion,
          },
        }
      );

      return response.data;
    },
    enabled: !!viewExternalId && !!viewVersion,
  });
};
