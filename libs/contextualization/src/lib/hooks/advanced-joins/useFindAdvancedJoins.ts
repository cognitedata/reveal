import { useQuery } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk/dist/src';

import { View } from '../../types';

export const useFindAdvancedJoins = (
  sdk: CogniteClient,
  headerName: string,
  view?: View
) => {
  const params = new URLSearchParams({
    space: view?.space || '',
    viewExternalId: view?.externalId || '',
    viewVersion: view?.version || '',
    propertyName: headerName,
  });

  return useQuery({
    queryKey: ['advancedjoins', 'list', view, headerName],
    queryFn: async () => {
      const response = await sdk.get(
        `/api/v1/projects/${sdk.project}/advancedjoins?${params}`,
        {
          headers: {
            'cdf-version': 'alpha',
          },
        }
      );

      return response.data.items;
    },
    enabled: !!view,
  });
};
