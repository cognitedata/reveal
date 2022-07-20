import queryString from 'query-string';

// @cognite/cdf-utilities utils
// please remove all the things below and adopt this package
// you also need to remove Breadcrumbs related components from this project and use those from cdf-utilities package

export const getProject = () =>
  new URL(window.location.href).pathname.split('/')[1];

export const getQueryParameter = (parameterKey: string) => {
  const parameters = queryString.parse(window.location.search) ?? {};
  return parameters[parameterKey] ?? '';
};

export const getCluster = () => {
  const cluster = getQueryParameter('cluster');
  return Array.isArray(cluster) ? cluster[0] : cluster;
};

export const getEnv = () => {
  const env = getQueryParameter('env');
  return Array.isArray(env) ? env[0] : env;
};

export const createLink = (
  path: string,
  queries: any = {},
  opts?: queryString.StringifyOptions
): string => {
  const project = getProject() || '';
  const env = getEnv();
  const cluster = getCluster();
  const query = queryString.stringify(
    { ...queries, ...(env ? { env } : {}), ...(cluster ? { cluster } : {}) },
    opts
  );
  if (query.length > 0) {
    return `/${project}${path}?${query}`;
  }
  if (path.length > 0 && path !== '/') {
    return `/${project}${path}`;
  }
  return `/${project}`;
};
