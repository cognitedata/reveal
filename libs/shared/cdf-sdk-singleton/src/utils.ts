import queryString from 'query-string';

import {
  getSelectedIdpDetails,
  IDPResponse,
  getDlc,
  cogIdpInternalId,
  cogIdpAsResponse,
} from '@cognite/login-utils';

export const getQueryParameter = (parameterKey: string): string => {
  const parameters = queryString.parse(window.location.search) ?? {};
  return (parameters[parameterKey] ?? '') as string;
};

export const getProject = (): string => {
  // example pathname: "/<project>/<subapp>/search/abc123"
  // this function will return the `<project>` part
  return window.location.pathname.split('/')[1];
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

export async function getIDP(): Promise<IDPResponse> {
  const { internalId } = getSelectedIdpDetails() ?? {};

  if (internalId === cogIdpInternalId) {
    return cogIdpAsResponse();
  }

  const dlc = await getDlc();
  const { idps } = dlc;
  if (!internalId && idps.length === 1) {
    return idps[0];
  }
  if (!internalId) {
    throw new Error('IDP not selected');
  }

  const idp = idps.find((idp) => idp.internalId === internalId);
  if (!idp) {
    throw new Error('IDP not found');
  }
  return idp;
}

const getDomainConfigCluster = async (): Promise<string | undefined> => {
  try {
    const idp = await getIDP();
    const clusters = (idp as IDPResponse)?.clusters;
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
