import { useMemo } from 'react';

import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { BASE_QUERY_KEY } from '../common';
import {
  ListCogIdpProjectsResponse,
  CogIdpError,
  PublicOrgResponse,
} from '../types';
import {
  cogIdpAuthority,
  getClientId,
  getCogniteIdPToken,
  getCogniteIdPUserManager,
  getProjectsForCogIdpOrg,
  getPublicOrg,
} from '../utils';

export const useCogniteIdPUserManager = (params: {
  authority: string;
  client_id: string;
}) => useMemo(() => getCogniteIdPUserManager(params), [params]);

const getPublicOrgQueryKey = [BASE_QUERY_KEY, 'cognite-idp', 'public-org'];
export const usePublicCogniteIdpOrg = (options: { timeout: number }) => {
  return useQuery<
    PublicOrgResponse | undefined,
    CogIdpError,
    PublicOrgResponse | undefined
  >(getPublicOrgQueryKey, () => getPublicOrg(options));
};

const getProjectsForCogIdpOrgQueryKey = [
  BASE_QUERY_KEY,
  'cognite-idp',
  'projects',
];
export const useProjectsForCogIdpOrg = (options: { enabled?: boolean }) => {
  const { data: token, isFetched } = useCogniteIdPToken();

  return useQuery<
    ListCogIdpProjectsResponse | undefined,
    CogIdpError,
    ListCogIdpProjectsResponse | undefined
  >(getProjectsForCogIdpOrgQueryKey, () => getProjectsForCogIdpOrg(token), {
    enabled: isFetched && options.enabled !== false,
  });
};

export const useProjectsForCogIdpOrgInCluster = (
  cluster: string,
  options: UseQueryOptions<string[], unknown, string[], string[]> = {
    enabled: true,
  }
): UseQueryResult<string[], unknown> => {
  const projectsResponse = useProjectsForCogIdpOrg({
    enabled: options.enabled,
  });

  const projectsInCluster = projectsResponse.data?.items
    .filter((p) => p.apiUrl === `https://${cluster}`)
    .map((p) => p.name);

  return {
    ...projectsResponse,
    data: projectsInCluster,
  } as UseQueryResult<string[], unknown>;
};

export const useCogniteIdPToken = (
  options: UseQueryOptions<string, unknown, string, string[]> = {
    enabled: true,
  }
) => {
  const userManager = useCogniteIdPUserManager({
    authority: cogIdpAuthority,
    client_id: getClientId(),
  });

  return useQuery(
    ['cognite_idp', 'token'],
    () => getCogniteIdPToken(userManager) as Promise<string>,
    options
  );
};
