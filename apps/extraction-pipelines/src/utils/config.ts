import queryString from 'query-string';
import Metrics from '@cognite/metrics';

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

export const setupMixpanel = () => {
  const mixpanelFusionToken = '5c4d853e7c3b77b1eb4468d5329b278c'; // pragma: allowlist secret

  Metrics.init({
    mixpanelToken: mixpanelFusionToken,
    debug: isDevelopment(),
  });

  // We opt out of tracking if we are on development
  if (isDevelopment()) {
    Metrics.optOut();
  } else {
    Metrics.optIn();
  }
};

export const handleUserIdentification = (email: string, tenant: string) => {
  Metrics.identify(email || 'not-identified-yet');
  Metrics.people({
    email,
    release: process.env.REACT_APP_RELEASE || 'unknown',
    project: tenant,
  });
};

export default {
  env: getEnvironment(),
};
