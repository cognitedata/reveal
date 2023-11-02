/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useQueries, useQuery } from '@tanstack/react-query';

import { BASE_QUERY_KEY } from '../common';
import {
  Auth0Response,
  CogniteIdPResponse,
  DomainResponse,
  IDPResponse,
  KeycloakResponse,
  LoginInfoError,
} from '../types';
import {
  getAADB2CToken,
  getAADToken,
  getADFS2016Token,
  getAuth0Client,
  getAuth0Token,
  getKeycloakToken,
  getPca,
  getProjects,
  getUserManager,
  getDlc,
  cogIdpAsResponse,
  cogIdpInternalId,
} from '../utils';

import {
  getAADB2CQueryKey,
  getAADQueryKey,
  getADFS2016QueryKey,
  useAADB2CProjects,
  useAADProjects,
  useADFS2016Projects,
} from './aad';
import { getAuth0QueryKey, useAuth0Projects } from './auth0';
import {
  useProjectsForCogIdpOrgInCluster,
  useProjectsForCogIdpOrg,
} from './cogniteIdP';
import { getKeycloakQueryKey, useKeycloakProjects } from './keycloak';

const getLoginInfoQueryKey = () => [BASE_QUERY_KEY, 'login-info'];
const getIdpQueryKey = (...args: string[]) => [BASE_QUERY_KEY, 'idp', ...args];

export const useLoginInfo = (
  options: { enabled: boolean } = { enabled: true }
) => {
  return useQuery<DomainResponse, LoginInfoError, DomainResponse>(
    getLoginInfoQueryKey(),
    getDlc,
    { enabled: options.enabled }
  );
};

export const useIdp = <T extends IDPResponse>(id?: string) => {
  const isCogIdp = id === cogIdpInternalId;
  const { data: loginInfo, isFetched: isFetchedLoginInfo } = useLoginInfo({
    enabled: !isCogIdp,
  });

  const { data: cogIdpProjects, isFetched: isFetchedCogIdpProjects } =
    useProjectsForCogIdpOrg({
      enabled: isCogIdp,
    });

  return useQuery(
    getIdpQueryKey(id ?? ''),
    () => {
      if (isCogIdp) {
        return cogIdpAsResponse(cogIdpProjects?.items) as T;
      } else {
        return loginInfo?.idps.find(({ internalId }) => internalId === id) as
          | T
          | undefined;
      }
    },
    {
      enabled:
        (isCogIdp && isFetchedCogIdpProjects) ||
        (!isCogIdp && isFetchedLoginInfo),
    }
  );
};

export const useIdpProjects = (
  cluster: string,
  idp?: IDPResponse,
  options?: { enabled?: boolean }
) => {
  const enabled = options?.enabled !== false;

  const aadEnabled = idp?.type === 'AZURE_AD';
  const aadProjectsQuery = useAADProjects(cluster, idp, {
    enabled: aadEnabled && enabled,
  });
  const aadB2CEnabled = idp?.type === 'AAD_B2C';
  // @ts-ignore
  const aadB2CProjectsQuery = useAADB2CProjects(cluster, idp, {
    enabled: aadB2CEnabled && enabled,
  });
  const adfsEnabled = idp?.type === 'ADFS2016';
  const adfsProjectsQuery = useADFS2016Projects(
    idp?.authority!,
    idp?.appConfiguration?.clientId!,
    cluster,
    { enabled: adfsEnabled }
  );
  const auth0Enabled = idp?.type === 'AUTH0';
  const auth0ProjectQuery = useAuth0Projects(cluster, idp, {
    enabled: auth0Enabled && enabled,
  });

  const keycloakEnabled = idp?.type === 'KEYCLOAK';
  const keycloakProjectQuery = useKeycloakProjects(
    cluster,
    idp as KeycloakResponse,
    {
      enabled: keycloakEnabled && enabled,
    }
  );

  const cogniteIdpEnabled = idp?.type === 'COGNITE_IDP';
  const cogniteIdpProjectQuery = useProjectsForCogIdpOrgInCluster(cluster, {
    enabled: cogniteIdpEnabled && enabled,
  });

  const unknownIdpQuery = useQuery(
    ['projects', 'unknown-idp'],
    () => Promise.reject(new Error('Unknown IDP')),
    {
      enabled:
        !aadEnabled &&
        !auth0Enabled &&
        !aadB2CEnabled &&
        !keycloakEnabled &&
        !cogniteIdpEnabled &&
        options?.enabled,
    }
  );

  switch (idp?.type) {
    case 'AZURE_AD': {
      return aadProjectsQuery;
    }
    case 'AAD_B2C':
      return aadB2CProjectsQuery;
    case 'AUTH0': {
      return auth0ProjectQuery;
    }
    case 'ADFS2016': {
      return adfsProjectsQuery;
    }
    case 'KEYCLOAK': {
      return keycloakProjectQuery;
    }
    case 'COGNITE_IDP': {
      return cogniteIdpProjectQuery;
    }
    default:
      return unknownIdpQuery;
  }
};

export const useIdpProjectsFromAllClusters = (
  clusters: string[],
  idp?: IDPResponse,
  options: { enabled: boolean } = { enabled: true }
) => {
  const getQueryKey = (cluster: string, type: 'token' | 'projects') => {
    switch (idp?.type) {
      case 'AZURE_AD':
      default:
        return getAADQueryKey(cluster, idp!, type);
      case 'AAD_B2C':
        return getAADB2CQueryKey(cluster, idp, type);
      case 'ADFS2016':
        return getADFS2016QueryKey(
          idp?.authority,
          idp?.appConfiguration.clientId,
          cluster,
          type
        );
      case 'AUTH0':
        return getAuth0QueryKey(cluster, idp, type);
      case 'KEYCLOAK':
        return getKeycloakQueryKey(cluster, idp, type);
      case 'COGNITE_IDP':
        return ['cognite_idp', 'dummy']; // We don't need a token from each cluster for Cognite IDP
    }
  };

  const getTokenQueryFn = (
    cluster: string
  ): (() =>
    | Promise<string>
    | Promise<{ accessToken: string; idToken: string }>
    | null) => {
    switch (idp?.type) {
      case 'AZURE_AD': {
        const pca = getPca(idp.appConfiguration.clientId, idp.authority);
        // @ts-ignore
        return () => getAADToken(cluster, pca);
      }
      case 'AAD_B2C': {
        const pca = getPca(idp.appConfiguration.clientId, idp.authority);
        // @ts-ignore
        return () => getAADB2CToken(cluster, pca);
      }
      case 'ADFS2016':
        return () =>
          getADFS2016Token(
            idp?.authority,
            idp?.appConfiguration.clientId,
            cluster
          );
      case 'AUTH0': {
        const auth0Idp = idp as Auth0Response;
        const auth0P = getAuth0Client(
          auth0Idp.appConfiguration.clientId,
          auth0Idp.authority,
          auth0Idp.appConfiguration.audience
        );
        // @ts-ignore
        return () => getAuth0Token(auth0P);
      }
      case 'KEYCLOAK':
        const kcIdp = idp as KeycloakResponse;
        const userManager = getUserManager({
          authority: kcIdp.authority || '',
          client_id: kcIdp.appConfiguration.clientId || '',
          cluster: cluster,
          realm: kcIdp.realm || '',
          audience: kcIdp.appConfiguration.audience || '',
        });
        // @ts-ignore
        return () => getKeycloakToken(userManager);
      case 'COGNITE_IDP':
        return () => null; // We don't need a token from each cluster for Cognite IDP
      default:
        return () => null;
    }
  };

  const tokens = useQueries({
    queries: clusters.map((cl) => ({
      queryKey: getQueryKey(cl, 'token'),
      queryFn: getTokenQueryFn(cl),
      enabled: options.enabled,
    })),
  });

  const projects = useQueries({
    queries: tokens.map(({ data }, i) => {
      const token = typeof data === 'object' ? data?.accessToken : data;
      return {
        queryKey: getQueryKey(clusters[i], 'projects'),
        queryFn: () => getProjects(clusters[i], token!),
        enabled: Boolean(token && options.enabled),
      };
    }),
  });

  const isCogIdp = idp?.internalId === cogIdpInternalId;
  const cogIdpProjects = useQueries({
    queries: clusters.map((cluster) => {
      const cogIdp = idp as CogniteIdPResponse;
      return {
        queryKey: ['cognite_idp', 'projects', cluster],
        queryFn: () => {
          return cogIdp.projects
            .filter((p) => p.apiUrl === `https://${cluster}`)
            .map((p) => p.name);
        },
        enabled: isCogIdp && options.enabled,
      };
    }),
  });

  if (isCogIdp) {
    return cogIdpProjects;
  }
  return tokens.map((tokenResponse, i) =>
    tokenResponse.isError ? { ...tokenResponse, data: null } : projects[i]
  );
};
