import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { getUrlParameters } from '../utils';

import { useCurrentView } from './models/useCurrentView';

const currentDate = new Date().toISOString();

export const useCreateAdvancedJoinProcess = (enabled: boolean | undefined) => {
  const sdk = useSDK();
  const view = useCurrentView();
  const { headerName } = getUrlParameters();

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
    queryKey: ['advancedjoins', 'create'],
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

      return response.data;
    },
    enabled: enabled && !!view,
  });
};
