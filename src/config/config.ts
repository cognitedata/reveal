import {
  isDevelopment,
  isPR,
  isProduction,
  isStaging,
} from 'utils/environment';

const env = typeof process !== 'undefined' ? process.env : ({} as any);

const stagePart = () => {
  if (isStaging) return 'Staging';
  if (isDevelopment) return 'Development';
  if (isPR) return 'Pull Request';
  return '';
};

const {
  REACT_APP_ENV = 'development',
  REACT_APP_COMMIT_REF = 'local',
  REACT_APP_LOCIZE_API_KEY,
  REACT_APP_MIXPANEL_TOKEN,
} = env;

const config = {
  azureAppId: '05aa256f-ba87-4e4c-902a-8e80ae5fb32e',
  appName: `Cognite Charts ${stagePart()}`,
  firebaseAppName: isProduction ? 'charts' : 'charts-dev',
  version: REACT_APP_COMMIT_REF,
  environment: REACT_APP_ENV,
  privacyPolicyUrl: 'https://www.cognite.com/en/policy',
  cogniteHubGroupUrl: 'https://hub.cognite.com/groups/charts-early-adopter-164',
  locizeProjectId: '1610fa5f-c8df-4aa8-9049-c08d8055d8ac',
  locizeApiKey: REACT_APP_LOCIZE_API_KEY,
  mixpanelToken: REACT_APP_MIXPANEL_TOKEN,
  sentryDSN:
    'https://b35f7e3635d34e44bd24a354dfc4f13a@o124058.ingest.sentry.io/5509609',
  intercomAppId: 'ou1uyk2p',
} as const;

export default config;
