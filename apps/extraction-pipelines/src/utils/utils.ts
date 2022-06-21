import queryString from 'query-string';
import { getEnv, getProject } from '@cognite/cdf-utilities';
import { styleScope } from './styleScope';

export { styleScope } from './styleScope';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

// TODO : CDFUX-1655 Refractor & use createRedirectLink i.e. createLink from @cognite/cdf-utilities
export const getQueryParameter = (parameterKey: any) => {
  const parameters = queryString.parse(window.location.search) ?? {};
  return parameters[parameterKey] ?? '';
};

export const getCluster = () => {
  const cluster = getQueryParameter('cluster');
  return Array.isArray(cluster) ? cluster[0] : cluster;
};

export const createRedirectLink = (
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
