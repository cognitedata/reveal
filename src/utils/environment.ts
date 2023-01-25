import {
  isDevelopment as isDev,
  isStaging as isStage,
  isProduction as isProd,
  checkUrl,
  Envs,
} from '@cognite/cdf-utilities';

export const isPR = checkUrl(Envs.PR);

export const isDevelopment =
  isDev() || window.location.hostname.includes('localhost'); // this is a fix for storybook
export const isStaging = isStage();
export const isProduction = isProd();
