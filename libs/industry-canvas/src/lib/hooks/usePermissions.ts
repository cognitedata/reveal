import { UseQueryOptions } from '@tanstack/react-query';

import { useCapabilities } from '@cognite/sdk-react-query-hooks';

export const usePermissions = (
  capability: string,
  action?: string,
  scope?: { spaceIdScope: { spaceIds: string[] } },
  options?: UseQueryOptions<{ acl: string; actions: string[]; scope: any }[]>
) => {
  const { data, ...queryProps } = useCapabilities(options);
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
