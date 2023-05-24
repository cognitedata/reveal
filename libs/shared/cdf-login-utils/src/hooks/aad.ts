/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useMemo } from 'react';

import {
  QueryObserverLoadingErrorResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { AADB2CResponse, AADError, AADResponse, IDPResponse } from '../types';
import {
  getAADB2CToken,
  getAADToken,
  getADFS2016Token,
  getPca,
  getProjects,
} from '../utils';

export const usePca = (
  clientId?: string,
  authority?: string,
  knownAuthorities?: string[]
) => {
  const pca = useMemo(
    () =>
      authority && clientId
        ? getPca(clientId, authority, knownAuthorities)
        : undefined,
    [authority, clientId, knownAuthorities]
  );

  return pca;
};

export const getAADQueryKey = (
  cluster: string,
  idp: IDPResponse,
  type: 'token' | 'projects'
) => [`aad-${type}`, cluster, ...(idp?.internalId ? [idp?.internalId] : [])];

export const useAADProjects = (
  cluster: string,
  idp?: AADResponse,
  options: UseQueryOptions<string[], AADError, string[], string[]> = {
    enabled: true,
  }
): UseQueryResult<string[], AADError> => {
  const tokenResponse = useAADToken(cluster, idp, {
    enabled: options.enabled,
  });
  const { data, error, isFetched } = tokenResponse;

  const projectResponse = useQuery<string[], AADError, string[], string[]>(
    getAADQueryKey(cluster, idp!, 'projects'),
    () => getProjects(cluster, data?.accessToken!),
    { ...options, enabled: isFetched && options.enabled }
  );

  if (error) {
    return {
      ...tokenResponse,
      data: undefined,
    } as QueryObserverLoadingErrorResult<string[], AADError>;
  }

  return projectResponse;
};

export const useAADToken = (
  cluster: string,
  idp?: AADResponse,
  options: UseQueryOptions<
    Record<string, string>,
    AADError,
    Record<string, string>,
    string[]
  > = {
    enabled: true,
  }
) => {
  const pca = usePca(idp?.appConfiguration.clientId, idp?.authority);

  return useQuery<
    Record<string, string>,
    AADError,
    Record<string, string>,
    string[]
  >(
    getAADQueryKey(cluster, idp!, 'token'),
    () => getAADToken(cluster, pca!).then((res) => res || {}),
    {
      enabled: !!pca && options?.enabled,
      ...options,
    }
  );
};

export const getAADB2CQueryKey = getAADQueryKey;

export const useAADB2CProjects = (
  cluster: string,
  idp?: AADB2CResponse,
  options: UseQueryOptions<string[], AADError, string[], string[]> = {
    enabled: true,
  }
): UseQueryResult<string[], AADError> => {
  const tokenResponse = useAADB2CToken(cluster, idp, {
    enabled: options.enabled,
  });
  const { data, error, isFetched } = tokenResponse;

  const projectResponse = useQuery<string[], AADError, string[], string[]>(
    getAADB2CQueryKey(cluster, idp!, 'projects'),
    () => getProjects(cluster, data?.accessToken!),
    { ...options, enabled: isFetched && options.enabled }
  );

  if (error) {
    return {
      ...tokenResponse,
      data: undefined,
    } as QueryObserverLoadingErrorResult<string[], AADError>;
  }

  return projectResponse;
};

export const useAADB2CToken = (
  cluster: string,
  idp?: AADB2CResponse,
  options: UseQueryOptions<
    Record<string, string>,
    AADError,
    Record<string, string>,
    string[]
  > = {
    enabled: true,
  }
) => {
  const authority = `${idp?.authority}/${idp?.policy}`;
  const knownAuth = idp ? [new URL(authority).hostname] : [];

  const pca = usePca(idp?.appConfiguration.clientId, authority, knownAuth);

  return useQuery<
    Record<string, string>,
    AADError,
    Record<string, string>,
    string[]
  >(
    getAADB2CQueryKey(cluster, idp!, 'token'),
    () => getAADB2CToken(cluster, pca!).then((res) => res || {}),
    {
      enabled: !!pca && options?.enabled,
      ...options,
    }
  );
};

export const getADFS2016QueryKey = (
  authority: string,
  clientId: string,
  cluster: string,
  type: 'token' | 'projects'
) => [`adfs-2016-${type}`, cluster, authority, clientId];

export const useADFS2016Projects = (
  authority: string,
  clientId: string,
  cluster: string,
  options: { enabled: boolean }
): UseQueryResult<string[], AADError> => {
  const tokenResponse = useADFS2016Token(authority, clientId, cluster, options);
  const { data: token, error, isFetched } = tokenResponse;

  const projectResponse = useQuery<string[], AADError, string[], string[]>(
    getADFS2016QueryKey(cluster, authority, clientId, 'projects'),
    () => getProjects(cluster, token!),
    { ...options, enabled: isFetched && options.enabled }
  );

  if (error) {
    return {
      ...tokenResponse,
      data: undefined,
    } as QueryObserverLoadingErrorResult<string[], AADError>;
  }

  return projectResponse;
};

export const useADFS2016Token = (
  authority: string,
  clientId: string,
  cluster: string,
  options: { enabled: boolean }
) => {
  return useQuery(
    getADFS2016QueryKey(authority, clientId, cluster, 'token'),
    () => getADFS2016Token(authority, clientId, cluster),
    options
  );
};
