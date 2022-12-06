import {
  isDevelopment as isDev,
  isStaging as isStage,
  checkUrl,
  isProduction as isProd,
} from '@cognite/cdf-utilities';

export const isPR = checkUrl('pr');

export const isDevelopment = isDev();
export const isStaging = isStage();
export const isProduction = isProd();
