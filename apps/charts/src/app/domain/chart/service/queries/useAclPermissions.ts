import { UseQueryOptions } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { usePermissions, Capability } from '@cognite/sdk-react-query-hooks';

export const useAclPermissions = (
  capability: string,
  action?: string,
  scope?: any,
  options?: UseQueryOptions<Capability[]>
) => {
  const project = getProject();

  return usePermissions(capability, action, scope, options, [project]);
};
