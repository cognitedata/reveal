import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useRetrieveInstances = (
  space: string,
  type: string,
  version: string,
  items: { space: string; externalId: string }[]
) => {
  const sdk = useSDK();
  const queryKeys = ['models', 'instances', 'byIds', items];

  const fetchJob = async () => {
    const response = await sdk.post(
      `/api/v1/projects/${sdk.project}/models/instances/byids`,
      {
        headers: { 'Content-Type': 'application/json' },
        data: {
          items: items.map(({ space, externalId }) => ({
            instanceType: 'node',
            space: space,
            externalId: externalId,
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
    enabled: !!items && items?.length !== 0,
  });
};
