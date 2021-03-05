import queryString from 'query-string';

export const projectName = () =>
  new URL(window.location.href).pathname.split('/')[1];

export const getCdfEnvFromUrl = () =>
  queryString.parse(window.location.search).env as string | undefined;

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
