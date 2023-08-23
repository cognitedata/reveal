import { useQuery } from '@tanstack/react-query';
// import { useSDK } from '@cognite/sdk-provider';

export const useCreateSuggestImprovementsJob = (
  advancedJoinExternalId: string | undefined,
  enabled: boolean | undefined
) => {
  // const sdk = useSDK();
  return useQuery({
    queryKey: [
      'context',
      'advancedjoins',
      'suggestimprovements',
      advancedJoinExternalId,
    ],
    queryFn: async () => {
      const response = await fetch(
        // `https://localhost:8443/api/v1/projects/${sdk.project}/context/advancedjoins/suggestimprovements`,
        `https://localhost:8443/api/v1/projects/contextualization/context/advancedjoins/suggestimprovements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            advancedJoinExternalId: advancedJoinExternalId,
          }),
        }
      );

      return response.json();
    },
    enabled: enabled,
  });
};
