// TODO(CDFUX-0): copies from @cognite/cdf-utilities!
import queryString from 'query-string';

export const getProject = () =>
  new URL(window.location.href).pathname.split('/')[1];

export const getEnv = () => {
  const param = queryString.parse(window.location.search).env;
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

export const createLink = (
  path: string,
  queries: any = {},
  opts?: queryString.StringifyOptions
): string => {
  const project = getProject() || '';
  const env = getEnv();
  const query = queryString.stringify({ ...queries, env }, opts);
  if (query.length > 0) {
    return `/${project}${path}?${query}`;
  }
  if (path.length > 0 && path !== '/') {
    return `/${project}${path}`;
  }
  return `/${project}`;
};
