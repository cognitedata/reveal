import { useMemo } from 'react';

import {
  QueryObserverLoadingErrorResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { IDPResponse, CogniteIdPResponse } from '../types/loginInfo';
import { getCogniteIdPToken, getCogniteIdPUserManager } from '../utils';
import { getProjects } from '../utils/shared';

export const useCogniteIdPUserManager = (params: {
  authority: string;
  client_id: string;
}) => useMemo(() => getCogniteIdPUserManager(params), [params]);

export const getCogniteIdPQueryKey = (
  idp: IDPResponse,
  type: 'token' | 'projects'
) => ['cognite_idp', type, ...(idp?.internalId ? [idp?.internalId] : [])];

export const useCogniteIdPProjects = (
  cluster: string,
  idp?: CogniteIdPResponse,
  options: UseQueryOptions<string[], unknown, string[], string[]> = {
    enabled: true,
  }
): UseQueryResult<string[], unknown> => {
  const tokenResponse = useCogniteIdPToken(idp, {
    enabled: options.enabled,
  });
  const { data: token, error, isFetched } = tokenResponse;

  const projectResponse = useQuery(
    getCogniteIdPQueryKey(idp!, 'projects'),
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

export const useCogniteIdPToken = (
  idp?: CogniteIdPResponse,
  options: UseQueryOptions<string, unknown, string, string[]> = {
    enabled: true,
  }
) => {
  const userManager = useCogniteIdPUserManager({
    authority: idp?.authority || '',
    client_id: idp?.appConfiguration.clientId || '',
  });

  return useQuery(
    getCogniteIdPQueryKey(idp!, 'token'),
    () => getCogniteIdPToken(userManager) as Promise<string>,
    options
  );
};
