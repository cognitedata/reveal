import { useQuery } from '@tanstack/react-query';

import { getUrlParameters } from '../utils';

import { useCurrentView } from './models/useCurrentView';

const currentDate = new Date().toISOString();

export const useCreateAdvancedJoinProcess = (enabled: boolean | undefined) => {
  const view = useCurrentView();
  const { headerName } = getUrlParameters();

  const body = JSON.stringify({
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
  });

  return useQuery({
    queryKey: ['context', 'advancedjoins', 'create'],
    queryFn: async () => {
      const response = await fetch(
        // `https://localhost:8443/api/v1/projects/${sdk.project}/advancedjoins`,
        `https://localhost:8443/api/v1/projects/contextualization/advancedjoins`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: body,
        }
      );

      return response.json();
    },
    enabled: enabled && !!view,
  });
};
