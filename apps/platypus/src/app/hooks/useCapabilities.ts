import { useQuery } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';

import { getCogniteSDKClient } from '../../environments/cogniteSdk';
import {
  Capability,
  Combine,
  CombinedSCC,
  KeysOfSCC,
  checkPermissions,
} from '../utils/capabilities';
import { QueryKeys } from '../utils/queryKeys';

export function useCapabilities<T extends KeysOfSCC>(
  aclName?: T,
  permissions?: CombinedSCC[T]['actions'],
  options?: { space?: string; checkAll?: boolean }
) {
  const { space, checkAll } = options || {};
  const tenant = getProject();
  const cdfClient = getCogniteSDKClient();
  const {
    data: token,
    isFetched: isTokenFetched,
    isError: isTokenError,
  } = useQuery(QueryKeys.TOKEN, () => cdfClient.get('/api/v1/token/inspect'));

  const platypusUserCapabilities = (token?.data.capabilities.filter(
    (cap: { projectScope: { projects: string | string[] } }) =>
      cap.projectScope.projects.includes(tenant)
  ) || []) as Combine<Capability>[];

  const hasPermissions = (permissions as string[]).every((el) =>
    checkPermissions(
      aclName,
      platypusUserCapabilities,
      [],
      el as CombinedSCC[T]['actions'][0],
      space,
      checkAll
    )
  );

  return {
    isError: isTokenError,
    isFetched: isTokenFetched,
    isAclSupported: hasPermissions,
  };
}
