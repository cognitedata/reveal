import queryString from 'query-string';

import { unifiedSignInAppName, unifiedSigninUrls } from '../common';

export const getQueryParameter = (parameterKey: string) => {
  const parameters = queryString.parse(window.location.search) ?? {};
  return parameters[parameterKey] ?? '';
};

export const getProject = () => {
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

export const getEnv = (): string | undefined => {
  const env = getQueryParameter('env');
  return Array.isArray(env) ? env[0] || undefined : env;
};

export const getOrganization = () => {
  if (isUsingUnifiedSignin()) {
    const organization = getQueryParameter('organization');
    return Array.isArray(organization) ? organization[0] : organization;
  }

  // otherwise the organization is in the subdomain
  // https://cog-appdev.dev.fusion.cogniteapp.com/
  return window.location.hostname.split('.')[0];
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

export const createLink = (
  path: string,
  queries: any = {},
  opts?: queryString.StringifyOptions
): string => {
  // No more base project name
  const cdfAppName = isUsingUnifiedSignin() ? `/${unifiedSignInAppName}` : '';
  const project = getProject() || '';
  const env = getEnv();
  const cluster = getCluster();
  const organization = isUsingUnifiedSignin() ? getOrganization() : '';
  const query = queryString.stringify(
    {
      ...queries,
      ...(env ? { env } : {}),
      ...(cluster ? { cluster } : {}),
      ...(organization ? { organization } : {}),
    },
    opts
  );

  const pathName =
    isUsingUnifiedSignin() && path.startsWith(`/${project}`)
      ? path.replace(`/${project}`, '')
      : path;

  if (query.length > 0) {
    return `${cdfAppName}/${project}${pathName}?${query}`;
  }
  if (pathName.length > 0 && path !== '/') {
    return `${cdfAppName}/${project}${path}`;
  }
  return `${cdfAppName}/${project}`;
};

/**
 * We check what Fusion environment it is by extracting what we suppose to be env
 * directly from the URL. We can't just check if the string representing env
 * is in the hostname because some org named include "dev" or "prod" string.
 *
 * Examples:
 *
 * dev.fusion.cogniteapp.com - dev - will return true for "dev"
 * fusion.cognite.com - prod - will return true for "prod"
 * next-release.fusion.cognite.com - next-release - will return true for "next-release"
 * devex.dev.fusion.cogniteapp.com - dev - will return true for "dev"
 * devex.fusion.cognite.com - prod - will return true for "prod"
 * devex.next-release.fusion.cognite.com - next-release - will return true for "next-release"
 */
export const checkUrl = (env: Envs) => {
  const { hostname } = window.location;
  // Disabling this eslint rule because Regex actually DOES need that escape
  // eslint-disable-next-line no-useless-escape
  const regex = /([^\.\s]*?)(?=.fusion)/gi;
  const hostnameEnvMatch = hostname.match(regex);
  const hostnameEnv = hostnameEnvMatch?.[0];
  if (env === 'prod') {
    /**
     * Production environment will return:
     * - null - if there's no org name in URL
     * - org name - if there is org name
     * To detect if env is production, we just check if hostname env is null or some
     * other string than other env names.
     */
    const nonProdEnvs = Object.keys(Envs).filter((e) => e !== Envs.PROD);
    return !hostnameEnv || !nonProdEnvs.includes(hostnameEnv);
  }
  return hostnameEnv === env;
};

export enum Envs {
  PROD = 'prod',
  DEV = 'dev',
  LOCALHOST = 'localhost',
  STAGING = 'staging',
  NEXT_RELEASE = 'next-release',
  PR = 'pr',
}

export const isDevelopment = () =>
  checkUrl(Envs.DEV) || checkUrl(Envs.LOCALHOST);
export const isStaging = () =>
  checkUrl(Envs.STAGING) || checkUrl(Envs.PR) || checkUrl(Envs.NEXT_RELEASE);
export const isProduction = () => !(isStaging() || isDevelopment());

export const getEnvironment = () => {
  if (isDevelopment()) {
    return 'development';
  }
  if (isStaging()) {
    return 'staging';
  }
  return 'production';
};

export const isValidEmail = (email: string) => {
  // Just checking by length as it's super tricky and fragile to check by char here.
  return /^.{1,64}@.{1,255}$/.test(email);
};

export const isUsingUnifiedSignin = () => {
  return (
    unifiedSigninUrls.includes(window.location.host) &&
    window.location.pathname.startsWith(`/${unifiedSignInAppName}`)
  );
};
