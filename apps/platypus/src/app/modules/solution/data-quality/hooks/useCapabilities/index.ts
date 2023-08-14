import { useSDK } from '@cognite/sdk-provider';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';

export * from './types';

import { Capability, RequiredScope } from './types';
import {
  groupCapabilities,
  isInCapabilityScope,
  isInProjectScope,
} from './helpers';

/**
 * Query returning a dictionary of capabilities and actions based on user's token.
 * Capabilities can be narrowed down with the 'projects' and 'scope' parameters.
 */
export const useCapabilities = (
  projects: string[] = [],
  scope: RequiredScope = {},
  options?: UseQueryOptions<Capability[]>
) => {
  const sdk = useSDK();

  const { data, ...queryParams } = useQuery<Capability[]>(
    ['token', 'capabilities'],
    async () => (await sdk.get('/api/v1/token/inspect')).data.capabilities,
    options
  );

  const capabilitiesList = data?.filter(
    (capability) =>
      isInProjectScope(capability, projects) &&
      isInCapabilityScope(capability, scope)
  );

  const capabilities = groupCapabilities(capabilitiesList);

  return { capabilities, ...queryParams };
};
