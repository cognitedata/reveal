import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useRetrieveViews = (
  space?: string,
  viewExternalIds?: string[]
) => {
  const sdk = useSDK();
  const queryKeys = ['models', 'views', 'byIds', space, viewExternalIds];

  const fetchJob = async () => {
    const response = await sdk.post(
      `/api/v1/projects/${sdk.project}/models/views/byids`,
      {
        headers: { 'Content-Type': 'application/json' },
        data: {
          items: viewExternalIds?.map((externalId) => ({
            space: space,
            externalId: externalId,
          })),
        },
      }
    );
    return response.data.items;
  };

  return useQuery({
    queryKey: queryKeys,
    queryFn: fetchJob,
    enabled: !!space && !!viewExternalIds,
  });
};
