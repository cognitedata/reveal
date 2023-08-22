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
  LegacyProject,
  LoginInfoError,
  ValidatedLegacyProject,
  ValidatedLegacyProjectsQueryReturnType,
} from '../types';
import {
  getAADB2CToken,
  getAADToken,
  getADFS2016Token,
  getAuth0Client,
  getAuth0Token,
  getCogniteIdPToken,
  getCogniteIdPUserManager,
  getKeycloakToken,
  getPca,
  getProjects,
  getUserManager,
  groupLegacyProjectsByValidationStatus,
  validateLegacyProject,
  getDlc,
  isWhitelistedHost,
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
import { getCogniteIdPQueryKey, useCogniteIdPProjects } from './cogniteIdP';
import { getKeycloakQueryKey, useKeycloakProjects } from './keycloak';

const getLoginInfoQueryKey = () => [BASE_QUERY_KEY, 'login-info'];
const getIdpQueryKey = (...args: string[]) => [BASE_QUERY_KEY, 'idp', ...args];
const getValidatedLegacyProjectKey = (projectName: string, cluster: string) => [
  BASE_QUERY_KEY,
  'validated-legacy-project',
  projectName,
  cluster,
];

const loginInfoQueryFn = async () => {
  if (isWhitelistedHost()) {
    return await getDlc();
  }

  return fetch(`/_api/login_info`)
    .then(async (r) => {
      if (r.status < 400) {
        return r.json();
      } else {
        const body = await r.json();
        return Promise.reject({
          status: r.status,
          body,
        });
      }
    })
    .catch((e) =>
      Promise.reject({ status: e.status, body: e.body || e.message })
    );
};

export const useLoginInfo = () => {
  return useQuery<DomainResponse, LoginInfoError, DomainResponse>(
    getLoginInfoQueryKey(),
    loginInfoQueryFn
  );
};

export const useIdp = <T extends IDPResponse>(id?: string) => {
  const { data: loginInfo, isFetched: isFetchedLoginInfo } = useLoginInfo();

  return useQuery(
    getIdpQueryKey(id ?? ''),
    () => {
      return loginInfo?.idps.find(({ internalId }) => internalId === id) as
        | T
        | undefined;
    },
    {
      enabled: isFetchedLoginInfo,
    }
  );
};

export const useIdpProjects = (
  cluster: string,
  idp?: IDPResponse,
  options: { enabled?: boolean } = { enabled: true }
) => {
  const aadEnabled = idp?.type === 'AZURE_AD';
  const aadProjectsQuery = useAADProjects(cluster, idp, {
    enabled: aadEnabled && options.enabled,
  });
  const aadB2CEnabled = idp?.type === 'AAD_B2C';
  // @ts-ignore
  const aadB2CProjectsQuery = useAADB2CProjects(cluster, idp, {
    enabled: aadB2CEnabled && options.enabled,
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
    enabled: auth0Enabled && options.enabled,
  });

  const keycloakEnabled = idp?.type === 'KEYCLOAK';
  const keycloakProjectQuery = useKeycloakProjects(
    cluster,
    idp as KeycloakResponse,
    {
      enabled: keycloakEnabled && options.enabled,
    }
  );

  const cogniteIdpEnabled = idp?.type === 'COGNITE_IDP';
  const cogniteIdpProjectQuery = useCogniteIdPProjects(
    cluster,
    idp as CogniteIdPResponse,
    {
      enabled: cogniteIdpEnabled && options.enabled,
    }
  );

  const unknownIdpQuery = useQuery(
    ['projects', 'unknown-idp'],
    () => Promise.reject(new Error('Unknown IDP')),
    {
      enabled:
        !aadEnabled &&
        !auth0Enabled &&
        !aadB2CEnabled &&
        !keycloakEnabled &&
        options.enabled,
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
        return getCogniteIdPQueryKey(
          idp,
          type,
          type === 'token' ? '' : cluster
        );
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
        const cdfIdp = idp as CogniteIdPResponse;
        const cdfUserManager = getCogniteIdPUserManager({
          authority: cdfIdp.authority || '',
          client_id: cdfIdp.appConfiguration.clientId || '',
        });
        return () => getCogniteIdPToken(cdfUserManager) as Promise<string>;
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

  return tokens.map((tokenResponse, i) =>
    tokenResponse.isError ? { ...tokenResponse, data: null } : projects[i]
  );
};

export function useValidatedLegacyProjects(
  shouldGroupProjects: false
): ValidatedLegacyProjectsQueryReturnType<false>;
export function useValidatedLegacyProjects(
  shouldGroupProjects: true
): ValidatedLegacyProjectsQueryReturnType<true>;
export function useValidatedLegacyProjects(
  shouldGroupProjects: boolean
):
  | ValidatedLegacyProjectsQueryReturnType<false>
  | ValidatedLegacyProjectsQueryReturnType<true> {
  const {
    data: loginInfo,
    error: loginInfoError,
    isFetched: isLoginInfoFetched,
  } = useLoginInfo();
  const { legacyProjects } = loginInfo ?? {
    legacyProjects: [] as LegacyProject[],
  };

  const queries = useQueries({
    queries: legacyProjects.map((legacyProject) => ({
      queryKey: getValidatedLegacyProjectKey(
        legacyProject.projectName,
        legacyProject.cluster
      ),
      queryFn: () => validateLegacyProject(legacyProject),
      enabled: isLoginInfoFetched,
    })),
  });

  const isFetched = queries.every((query) => query.isFetched);
  const isFetching = queries.some((query) => query.isFetching);
  const isLoading = queries.some((query) => query.isLoading);

  const data = isFetched
    ? (queries
        .map((query) => query.data)
        .filter(Boolean) as ValidatedLegacyProject[])
    : [];

  if (shouldGroupProjects) {
    return {
      data: groupLegacyProjectsByValidationStatus(data),
      error: loginInfoError!,
      isError: !!loginInfoError,
      isFetched,
      isFetching,
      isLoading,
    };
  }

  return {
    data: data,
    error: loginInfoError!,
    isError: !!loginInfoError,
    isFetched,
    isFetching,
    isLoading,
  };
}
