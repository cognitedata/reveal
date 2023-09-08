import { useQuery } from '@tanstack/react-query';

import type { CogniteCapability, CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const getCapabilities = async (sdk: CogniteClient) =>
  sdk.get<{ capabilities: CogniteCapability }>('/api/v1/token/inspect');

export const useCapabilities = () => {
  const sdk = useSDK();

  const { data, isFetched } = useQuery<CogniteCapability>(
    ['capabilities'],
    async () => {
      try {
        const response = await getCapabilities(sdk);
        return response.data.capabilities;
      } catch (e) {
        return [];
      }
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  return { data, isFetched };
};
