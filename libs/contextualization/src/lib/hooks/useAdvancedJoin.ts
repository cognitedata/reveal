import { useQuery } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { View } from '../types';
import { getUrlParameters } from '../utils';

import { useCurrentView } from './models/useCurrentView';

const currentDate = new Date().toISOString();

export const useAdvancedJoin = (
  headerName: string,
  view?: View,
  enabled: boolean = true
) => {
  const sdk = useSDK();

  const shouldFindAdvancedJoins = enabled && !!view;
  const existingAdvancedJoin = useFindAdvancedJoins(
    sdk,
    headerName,
    view,
    enabled && !!view
  );

  const shouldCreateAdvancedJoin =
    shouldFindAdvancedJoins && existingAdvancedJoin?.data?.length === 0;
  const newAdvancedJoin = useCreateAdvancedJoin(
    sdk,
    headerName,
    view,
    shouldCreateAdvancedJoin
  );

  if (existingAdvancedJoin?.data !== undefined) {
    return existingAdvancedJoin.data[0];
  } else if (newAdvancedJoin?.data !== undefined) {
    return newAdvancedJoin.data[0];
  }

  return undefined;
};

const useFindAdvancedJoins = (
  sdk: CogniteClient,
  headerName: string,
  view?: View,
  enabled: boolean = true
) => {
  const params = new URLSearchParams({
    space: view?.space || '',
    viewExternalId: view?.externalId || '',
    viewVersion: view?.version || '',
    propertyName: headerName,
  });

  return useQuery({
    queryKey: ['advancedjoins', 'list', view, headerName, enabled],
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
    enabled: enabled && !!view,
  });
};

const useCreateAdvancedJoin = (
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
    enabled: enabled && !!view,
  });
};
