/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from 'react';

import {
  QueryObserverLoadingErrorResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { IDPResponse, KeycloakResponse } from '../types/loginInfo';
import { getKeycloakToken, getUserManager } from '../utils';
import { getProjects } from '../utils/shared';

export const useKeycloakUserManager = (params: {
  authority: string;
  client_id: string;
  cluster: string;
  realm?: string;
  audience?: string;
}) => useMemo(() => getUserManager(params), [params]);

export const getKeycloakQueryKey = (
  cluster: string,
  idp: IDPResponse,
  type: 'token' | 'projects'
) => ['keycloak', type, cluster, ...(idp?.internalId ? [idp?.internalId] : [])];

export const useKeycloakProjects = (
  cluster: string,
  idp?: KeycloakResponse,
  options: UseQueryOptions<string[], unknown, string[], string[]> = {
    enabled: true,
  }
): UseQueryResult<string[], unknown> => {
  const tokenResponse = useKeycloakToken(cluster, idp, {
    enabled: options.enabled,
  });
  const { data: token, error, isFetched } = tokenResponse;

  const projectResponse = useQuery(
    getKeycloakQueryKey(cluster, idp!, 'projects'),
    () => getProjects(cluster, token!),
    { ...options, enabled: isFetched && options.enabled }
  );

  if (error) {
    return {
      ...tokenResponse,
      data: undefined,
    } as QueryObserverLoadingErrorResult<string[], unknown>;
  }
  return projectResponse;
};

export const useKeycloakToken = (
  cluster: string,
  idp?: KeycloakResponse,
  options: UseQueryOptions<string, unknown, string, string[]> = {
    enabled: true,
  }
) => {
  const userManager = useKeycloakUserManager({
    authority: idp?.authority || '',
    client_id: idp?.appConfiguration.clientId || '',
    cluster: cluster,
    realm: idp?.realm || '',
    audience: idp?.appConfiguration.audience || '',
  });

  return useQuery(
    getKeycloakQueryKey(cluster, idp!, 'token'),
    () => getKeycloakToken(userManager).then((res) => res || ''),
    options
  );
};
