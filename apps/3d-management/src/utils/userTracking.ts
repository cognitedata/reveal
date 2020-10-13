import * as Sentry from '@sentry/browser';
import {
  getProject,
  getEnvironment,
  isDevelopment,
} from '@cognite/cdf-utilities';
import { Metrics } from '@cognite/metrics';

// const setupSupportChat = () => {
//   // if we are on dev, we set the Intercom widget to a mock function
//   if (isDevelopment()) {
//     // @ts-ignore
//     window.Intercom = () => {};
//   }
//   try {
//     // @ts-ignore
//     window.Intercom('boot', {
//       app_id: 'ou1uyk2p',
//       hide_default_launcher: true,
//     });
//   } catch (e) {
//     // Intercom not available, but let's not crash
//     if (isProduction()) {
//       Sentry.captureException(e);
//     }
//   }
// };

const setupSentry = () => {
  Sentry.init({
    dsn: 'https://d09f6d3557114e6cbaa63b56d7ef86cc@sentry.io/1288725',
    environment: getEnvironment(),
    release: process.env.REACT_APP_RELEASE || 'unknown',
  });
};

const setupMixpanel = () => {
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

export const setupUserTracking = () => {
  setupMixpanel();
  // setupSupportChat();
  setupSentry();
};

export const handleUserIdentification = (email: string) => {
  Metrics.identify(email || 'not-identified-yet');
  Metrics.people({
    email,
    release: process.env.REACT_APP_RELEASE || 'unknown',
    project: getProject(),
  });
};
