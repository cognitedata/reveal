import { UseQueryOptions } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';

import { IDPType } from '@cognite/login-utils';
import { useCapabilities } from '@cognite/sdk-react-query-hooks';

import type { Flow } from '@data-exploration-lib/core';

export const usePermissions = (
  flow: Flow,
  capability: string,
  action?: string,
  scope?: { spaceIdScope: { spaceIds: string[] } },
  options?: UseQueryOptions<{ acl: string; actions: string[]; scope: any }[]>
) => {
  const { data, ...queryProps } = useCapabilities(flow as IDPType, options);
  const capabilities =
    data?.filter(
      (c) =>
        c.acl === capability &&
        (Object.keys(c.scope).includes('all') ||
          scope === undefined ||
          scope.spaceIdScope.spaceIds.every((s) =>
            c.scope.spaceIdScope.spaceIds.includes(s)
          ))
    ) ?? [];
  return {
    ...queryProps,
    data:
      capabilities.length > 0 &&
      (action === undefined ||
        capabilities.some((c) =>
          c.actions.some((a) => a.toLowerCase() === action.toLowerCase())
        )),
  };
};
