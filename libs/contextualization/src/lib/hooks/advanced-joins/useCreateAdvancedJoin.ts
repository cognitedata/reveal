import { useQuery } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk/dist/src';

import { View } from '../../types';

const currentDate = new Date().toISOString();

export const useCreateAdvancedJoin = (
  sdk: CogniteClient,
  headerName: string,
  view?: View,
  enabled: boolean = true
) => {
  const body = {
    items: [
      {
        externalId: `advanced-join-process-${currentDate}`, //random uid?
        type: 'direct',
        space: view?.space,
        viewExternalId: view?.externalId,
        viewVersion: view?.version,
        propertyName: headerName,
      },
    ],
  };

  return useQuery({
    queryKey: ['advancedjoins', 'create', view, headerName, enabled],
    queryFn: async () => {
      const response = await sdk.post(
        `/api/v1/projects/${sdk.project}/advancedjoins`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
          data: body,
        }
      );

      return response.data.items;
    },
    enabled: enabled,
  });
};
