import {
  checkPermissions,
  KeysOfSCC,
  Capability,
  Combine,
  CombinedSCC,
} from '@platypus-app/utils/capabilities';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { getTenant } from '@platypus-app/utils/tenant-utils';
import { useQuery } from '@tanstack/react-query';

import { getCogniteSDKClient } from '../../environments/cogniteSdk';

export function useCapabilities<T extends KeysOfSCC>(
  aclName?: T,
  permissions?: CombinedSCC[T]['actions'],
  options?: { space?: string; checkAll?: boolean }
) {
  const { space, checkAll } = options || {};
  const tenant = getTenant();
  const cdfClient = getCogniteSDKClient();
  const {
    data: token,
    isFetched: isTokenFetched,
    isError: isTokenError,
  } = useQuery(QueryKeys.TOKEN, () => cdfClient.get('/api/v1/token/inspect'));

  const {
    data: groups,
    isFetched: isGroupsFetched,
    isError: isGroupError,
  } = useQuery(QueryKeys.GROUPS, () => cdfClient.groups.list(), {
    enabled: !isTokenError,
  });

  if (isGroupError && isTokenError) {
    return {
      isError: true,
    };
  }

  const userGroupCapabilities = (groups?.flatMap((gr) => gr.capabilities) ??
    []) as Combine<Capability>[];

  const platypusUserCapabilities = (token?.data.capabilities.filter(
    (cap: { projectScope: { projects: string | string[] } }) =>
      cap.projectScope.projects.includes(tenant)
  ) || []) as Combine<Capability>[];

  const hasPermissions = (permissions as string[]).every((el) =>
    checkPermissions(
      aclName,
      platypusUserCapabilities,
      userGroupCapabilities,
      el as CombinedSCC[T]['actions'][0],
      space,
      checkAll
    )
  );

  return {
    isError: isGroupError && isTokenError,
    isFetched: isTokenFetched && isGroupsFetched,
    isAclSupported: hasPermissions,
  };
}
