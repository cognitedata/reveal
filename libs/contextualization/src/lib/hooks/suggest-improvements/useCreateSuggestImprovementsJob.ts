import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useCreateSuggestImprovementsJob = (
  advancedJoinExternalId: string | undefined,
  enabled: boolean | undefined
) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['advancedjoins', 'suggestimprovements', advancedJoinExternalId],
    queryFn: async () => {
      const response = await sdk.post(
        `/api/v1/projects/${sdk.project}/advancedjoins/suggestimprovements`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
          data: {
            advancedJoinExternalId: advancedJoinExternalId,
          },
        }
      );

      return response.data;
    },
    enabled: enabled,
  });
};
