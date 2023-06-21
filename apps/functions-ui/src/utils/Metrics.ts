import queryString from 'query-string';

import { Metrics } from '@cognite/metrics';

export const projectName = () =>
  new URL(window.location.href).pathname.split('/')[1];

export const getCdfEnvFromUrl = () =>
  queryString.parse(window.location.search).env as string | undefined;

export const checkUrl = (env: string) => window.location.hostname.includes(env);
export const isDevelopment = () => checkUrl('dev') || checkUrl('localhost');
export const isStaging = () => checkUrl('staging') || checkUrl('pr');
export const isProduction = () => !(isStaging() || isDevelopment());

export const getEnvironment = () => {
  if (isDevelopment()) return 'development';
  if (isStaging()) return 'staging';
  return 'production';
};

const MIXPANEL_TOKEN = '504cfc7feaad55b838d866aff8f91a58';

export const setupMixpanel = () => {
  const mixpanelFusionToken = MIXPANEL_TOKEN; // pragma: allowlist secret
  const mixpanelFusionDevToken = MIXPANEL_TOKEN; // pragma: allowlist secret

  const mixpanelToken = isDevelopment()
    ? mixpanelFusionDevToken
    : mixpanelFusionToken;

  Metrics.init({
    mixpanelToken,
    debug: isDevelopment(),
  });

  // We opt out of tracking if we are on development
  if (isDevelopment()) {
    Metrics.optOut();
  } else {
    Metrics.optIn();
  }
};

export const handleUserIdentification = (email: string) => {
  Metrics.identify(email || 'not-identified-yet');
  Metrics.people({
    email,
    name: email,
  });
};

export default {
  env: getEnvironment(),
};
