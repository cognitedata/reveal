/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from 'react';

import {
  QueryObserverLoadingErrorResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { Auth0Response, IDPResponse } from '../types';
import { getAuth0Client, getAuth0Token, getProjects } from '../utils';

export const useAuth0 = (
  clientId?: string,
  domain?: string,
  audience?: string
) => {
  return useMemo(() => {
    if (clientId && domain) {
      return getAuth0Client(clientId, domain, audience);
    }
    return undefined;
  }, [clientId, domain, audience]);
};

export const getAuth0QueryKey = (
  cluster: string,
  idp: IDPResponse,
  type: 'token' | 'projects'
) => ['auth0', type, cluster, ...(idp?.internalId ? [idp?.internalId] : [])];

export const useAuth0Projects = (
  cluster: string,
  idp?: Auth0Response,
  options: UseQueryOptions<string[], unknown, string[], string[]> = {
    enabled: true,
  }
): UseQueryResult<string[], unknown> => {
  const tokenResponse = useAuth0Token(cluster, idp, {
    enabled: options.enabled,
  });
  const { data: token, error, isFetched } = tokenResponse;

  const projectResponse = useQuery(
    getAuth0QueryKey(cluster, idp!, 'projects'),
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

export const useAuth0Token = (
  cluster: string,
  idp?: Auth0Response,
  options: UseQueryOptions<string, unknown, string, string[]> = {
    enabled: true,
  }
) => {
  const auth0P = useAuth0(
    idp?.appConfiguration?.clientId!,
    idp?.authority!,
    idp?.appConfiguration?.audience
  );

  return useQuery(
    getAuth0QueryKey(cluster, idp!, 'token'),
    () => getAuth0Token(auth0P!).then((res) => res || ''),
    options
  );
};

export const useAuth0UserName = (
  idp?: Auth0Response,
  options: UseQueryOptions<
    string | undefined,
    unknown,
    string | undefined,
    string[]
  > = {
    enabled: true,
  }
) => {
  const auth0P = useAuth0(
    idp?.appConfiguration?.clientId!,
    idp?.authority!,
    idp?.appConfiguration?.audience
  );
  return useQuery(
    ['auth0', 'user', ...(idp?.internalId ? [idp?.internalId] : [])],
    async () => {
      const auth0 = await auth0P;
      if (auth0) {
        const user = await auth0.getUser();
        return user?.given_name;
      }
      return;
    },
    options
  );
};
