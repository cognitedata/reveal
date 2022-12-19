// TODO(CDFUX-0): copies from @cognite/cdf-utilities!
import queryString from 'query-string';

enum PARAMS {
  ENV = 'env',
  CLUSTER = 'cluster',
}

export const getProject = () =>
  new URL(window.location.href).pathname.split('/')[1];

export const getEnv = (key: PARAMS) => {
  const param = queryString.parse(window.location.search)[key];

  if (param instanceof Array) {
    return param[0];
  }
  if (typeof param === 'string') {
    return param;
  }
  return undefined;
};

export const checkUrl = (env: string) => window.location.hostname.includes(env);
export const isDevelopment = () => checkUrl('dev') || checkUrl('localhost');
export const isStaging = () => checkUrl('staging') || checkUrl('pr');
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
