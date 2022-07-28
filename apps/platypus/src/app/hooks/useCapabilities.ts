import { useQuery } from 'react-query';
import { getCogniteSDKClient } from '../../environments/cogniteSdk';

import config from '@platypus-app/config/config';
import { getTenant } from '@platypus-app/utils/tenant-utils';
import {
  checkPermissions,
  checkAuthorized,
  KeysOfSCC,
  Capability,
  Combine,
  CombinedSCC,
} from '@platypus-app/utils/capabilities';

const DEFAULT_GROUPS = [config.MIXER_API_GROUP_NAME, config.DMS_API_GROUP_NAME];

export function useCapabilities<T extends KeysOfSCC>(
  aclName?: T,
  permissions?: CombinedSCC[T]['actions'],
  requestedGroups = DEFAULT_GROUPS
) {
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

  const userGroupNames = groups?.map((group) => group.name) ?? [];
  const userGroupCapabilities = (groups?.flatMap((gr) => gr.capabilities) ??
    []) as Combine<Capability>[];

  const platypusUserCapabilities = (token?.data.capabilities.filter(
    (cap: { projectScope: { projects: string | string[] } }) =>
      cap.projectScope.projects.includes(tenant)
  ) || []) as Combine<Capability>[];

  const hasPermissions = checkPermissions(
    aclName,
    platypusUserCapabilities,
    userGroupCapabilities,
    permissions
  );

  const isAuthorized = checkAuthorized(
    platypusUserCapabilities,
    requestedGroups,
    userGroupNames
  );

  return {
    isError: isGroupError && isTokenError,
    isFetched: isTokenFetched && isGroupsFetched,
    isAclSupported: hasPermissions,
    isAuthorized,
  };
}
