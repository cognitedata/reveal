import queryString from 'query-string';

import {
  getSelectedIdpDetails,
  IDPResponse,
  getDlc,
  LegacyProject,
  isWhitelistedHost,
} from '@cognite/login-utils';
import { CogniteClient } from '@cognite/sdk';

import { isUsingUnifiedSignin } from './unified-signin';

export const getQueryParameter = (parameterKey: string): string => {
  const parameters = queryString.parse(window.location.search) ?? {};
  return (parameters[parameterKey] ?? '') as string;
};

export const getProject = (): string => {
  if (isUsingUnifiedSignin()) {
    const project = getQueryParameter('project');
    // If we're able to find the project return it, otherwise default to the previous behaviour.
    if (project) {
      return project;
    }
  }

  // if unified signin, the url is apps.cognite.com/cdf/project
  // otherwise is fusion.cognite.com/project
  // when splitting, for fusion index is 1, for /cdf is 2
  const projectPathParamLocation = isUsingUnifiedSignin() ? 2 : 1;

  return new URL(window.location.href).pathname.split('/')[
    projectPathParamLocation
  ];
};

export const getCluster = () => {
  const cluster = getQueryParameter('cluster');
  return Array.isArray(cluster) ? cluster[0] : cluster;
};

export const getEnv = () => {
  const env = getQueryParameter('env');
  return Array.isArray(env) ? env[0] : env;
};

export const getUrl = (
  hostname: string,
  protocol: 'https' | 'http' = 'https'
) => {
  let url = hostname;
  if (hostname.substr(0, protocol.length) !== protocol) {
    url = `${protocol}://${hostname}`;
  }
  return url;
};

export async function getIDP(): Promise<IDPResponse | LegacyProject> {
  const { internalId } = getSelectedIdpDetails() ?? {};

  if (isWhitelistedHost()) {
    const dlc = await getDlc();
    const idp = dlc?.idps?.find(
      (idp: IDPResponse) => idp.internalId === internalId
    );
    if (!idp) {
      return Promise.reject(new Error('IDP not found'));
    }
    return idp;
  }

  const { idps = [], legacyProjects = [] } = await fetch(
    `/_api/login_info`
  ).then(
    (r: Response) =>
      r.json() as Promise<{
        idps: IDPResponse[];
        legacyProjects: LegacyProject[];
      }>
  );

  if (!internalId && idps.length === 1) {
    return idps[0];
  }
  if (!internalId) {
    return Promise.reject(new Error('IDP not selected'));
  }

  const idp =
    idps.find((i) => i.internalId === internalId) ||
    legacyProjects.find((l) => l.internalId === internalId);

  if (!idp) {
    return Promise.reject(new Error('IDP not found'));
  }
  return idp;
}

export const getDomainConfigCluster = async (): Promise<string | undefined> => {
  try {
    const idp = await getIDP();

    const clusters =
      idp.type !== 'COGNITE_AUTH' ? (idp as IDPResponse)?.clusters : undefined;
    if (clusters?.length === 1) {
      return clusters[0];
    }
    return undefined;
  } catch {
    return undefined;
  }
};

export const getBaseUrl = async (): Promise<string | undefined> => {
  const urlCluster = getCluster();
  if (urlCluster) {
    return getUrl(urlCluster);
  }
  const domainServiceCluster = await getDomainConfigCluster();
  if (domainServiceCluster) {
    return getUrl(domainServiceCluster);
  }
  return Promise.reject(new Error('cluster not found'));
};

/* eslint-disable */
export function convertToProxy(originalInstance: CogniteClient) {
  originalInstance = Object(originalInstance);
  let proxy = new Proxy(new WrappedSdkClient(originalInstance), {
    get: function (originalObj, key, proxy) {
      switch (key) {
        case 'overrideInstance':
          return originalObj.overrideInstance;
        default:
          // @ts-ignore
          return originalObj.instance[key];
      }
    },
  });
  return proxy;
}

export class WrappedSdkClient {
  instance: CogniteClient;

  constructor(sdkInstance: CogniteClient) {
    this.instance = sdkInstance;
  }

  overrideInstance(newSdk: CogniteClient) {
    this.instance = newSdk;
  }
}
