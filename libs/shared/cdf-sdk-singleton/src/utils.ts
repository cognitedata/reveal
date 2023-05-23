import {
  getSelectedIdpDetails,
  IDPResponse,
  LegacyProject,
} from '@cognite/login-utils';
import queryString from 'query-string';

export const getQueryParameter = (parameterKey: string) => {
  const parameters = queryString.parse(window.location.search) ?? {};
  return parameters[parameterKey] ?? '';
};

export const getProject = () =>
  new URL(window.location.href).pathname.split('/')[1];

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

  if (!internalId) {
    return Promise.reject(new Error('IDP not selected'));
  }
  const { idps = [], legacyProjects = [] } = await fetch(
    `https://app-login-configuration-lookup.cognite.ai/fusion/cog-demo`
  ).then(
    (r: Response) =>
      r.json() as Promise<{
        idps: IDPResponse[];
        legacyProjects: LegacyProject[];
      }>
  );

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
  // TODO
  return 'cluster';
  return Promise.reject(new Error('cluster not found'));
};
