import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useRetrieveInstances = (
  space: string,
  type: string,
  version: string,
  suggestions: any[]
) => {
  const sdk = useSDK();
  const queryKeys = ['models', 'instances', 'byIds', suggestions];

  const fetchJob = async () => {
    const response = await sdk.post(
      `/api/v1/projects/${sdk.project}/models/instances/byids`,
      {
        headers: { 'Content-Type': 'application/json' },
        data: {
          items: suggestions.map(({ space, originExternalId }) => ({
            instanceType: 'node',
            space: space,
            externalId: originExternalId,
          })),
          sources: [
            {
              source: {
                type: 'view',
                space: space,
                externalId: type,
                version: version,
              },
            },
          ],
        },
      }
    );
    return response.data.items;
  };

  return useQuery({
    queryKey: queryKeys,
    queryFn: fetchJob,
    enabled: !!suggestions,
  });
};
