// TODO(CDFUX-0): copies from @cognite/cdf-utilities!
import queryString from 'query-string';

import { createLink } from '@cognite/cdf-utilities';

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

export const removeProjectFromPath = (path: string) => {
  return `/${path.split('/').slice(2).join('/')}`;
};

export const getSubAppPath = () => {
  const mountPoint = window.location.pathname.split('/')[2];
  return `/${mountPoint}`;
};

export const createInternalLink = (path: string, searchParams?: string) => {
  if (!searchParams) return createLink(path);

  return createLink(path, getSearchParams(searchParams));
};

// Parsed object is not stringified back correctly when `opts` is given as `arrayFormat: 'comma'`,
// so be very careful while using with `opts` here!
export const getSearchParams = (
  searchParams: string,
  opts?: queryString.StringifyOptions
) => {
  return queryString.parse(searchParams, opts);
};
