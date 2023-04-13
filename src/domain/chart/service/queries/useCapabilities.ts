import { useQuery, UseQueryResult } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteCapability } from '@cognite/sdk';
import { getCapabilities } from '../network/getCapabilities';

export type CapabilityWithExperimentAcl = {
  experimentAcl: {
    scope: {
      experimentscope: {
        experiments: string[];
      };
    };
    actions: string[];
  };
};

export const useCapabilities = (): UseQueryResult<CogniteCapability> => {
  const sdk = useSDK();

  return useQuery<CogniteCapability>(
    'capabilities',
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
};
