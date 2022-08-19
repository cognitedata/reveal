import { createLink } from '@cognite/cdf-utilities';
import queryString from 'query-string';

export const projectName = () =>
  new URL(window.location.href).pathname.split('/')[1];

export const getCdfEnvFromUrl = () =>
  queryString.parse(window.location.search).env as string | undefined;

export const getUrlWithQueryParams = (baseLink: string) => {
  const query = queryString.parse(window.location.search);
  const link = createLink(baseLink, query);

  return link;
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

export default {
  env: getEnvironment(),
};

// # of resources checked for possible match fields out of total
export const NUM_OF_RESOURCES_CHECKED = 100;
