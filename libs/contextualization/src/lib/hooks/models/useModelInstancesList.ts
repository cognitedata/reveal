import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useModelInstancesList = (
  space: string,
  type: string,
  version: string
) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['models', 'instances', 'list', 'view', space, type, version],
    queryFn: async () => {
      const response = await sdk.post(
        `/api/v1/projects/${sdk.project}/models/instances/list`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            sources: [
              {
                source: {
                  type: 'view',
                  space: space, // Id of the space that the view belongs to
                  externalId: type, // External-id of the view
                  version: version, // Version of the view
                },
              },
            ],
          },
        }
      );
      return response.data.items;
    },
  });
};
