import { useMutation } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

export const useModelInstancesSearch = () => {
  const sdk = useSDK();

  return useMutation(
    async ({
      space,
      type,
      version,
      query,
    }: {
      space?: string;
      type?: string;
      version?: string;
      query: string;
    }) => {
      const response = await sdk.post(
        `/api/v1/projects/${sdk.project}/models/instances/search`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            view: {
              type: 'view',
              space: space, // Id of the space that the view belongs to
              externalId: type, // External-id of the view
              version: version, // Version of the view
            },
            query: query,
          },
        }
      );

      return response.data;
    }
  );
};
