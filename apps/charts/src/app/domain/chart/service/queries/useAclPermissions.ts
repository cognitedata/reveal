import { UseQueryOptions } from '@tanstack/react-query';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { getProject } from '@cognite/cdf-utilities';
import { usePermissions, Capability } from '@cognite/sdk-react-query-hooks';

export const useAclPermissions = (
  capability: string,
  action?: string,
  scope?: any,
  options?: UseQueryOptions<Capability[]>
) => {
  const { flow } = getFlow();
  const project = getProject();

  // @ts-ignore flow types don't match
  return usePermissions(flow, capability, action, scope, options, [project]);
};
