import { useQuery } from 'react-query';
import { getCogniteSDKClient } from '../../environments/cogniteSdk';

import { getTenant } from '@platypus-app/utils/tenant-utils';
import {
  checkPermissions,
  KeysOfSCC,
  Capability,
  Combine,
  CombinedSCC,
} from '@platypus-app/utils/capabilities';

export function useCapabilities<T extends KeysOfSCC>(
  aclName?: T,
  permissions?: CombinedSCC[T]['actions'],
  options?: { externalId?: string; checkAll?: boolean }
) {
  const { externalId, checkAll } = options || {};
  const tenant = getTenant();
  const cdfClient = getCogniteSDKClient();
  const {
    data: token,
    isFetched: isTokenFetched,
    isError: isTokenError,
  } = useQuery('token', () => cdfClient.get('/api/v1/token/inspect'));

  const {
    data: groups,
    isFetched: isGroupsFetched,
    isError: isGroupError,
  } = useQuery('groups', () => cdfClient.groups.list(), {
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
      externalId,
      checkAll
    )
  );

  return {
    isError: isGroupError && isTokenError,
    isFetched: isTokenFetched && isGroupsFetched,
    isAclSupported: hasPermissions,
  };
}
