import * as Sentry from '@sentry/browser';
import {
  getEnvironment,
  isDevelopment,
  isProduction,
  isStaging,
} from '@cognite/cdf-utilities';

const setupSupportChat = () => {
  // if we are on dev, we set the Intercom widget to a mock function
  if (isDevelopment()) {
    // @ts-ignore
    window.Intercom = () => {};
  }
  try {
    // @ts-ignore
    window.Intercom('boot', {
      app_id: 'ou1uyk2p',
      hide_default_launcher: true,
    });
  } catch (e) {
    // Intercom not available, but let's not crash
    if (isProduction()) {
      Sentry.captureException(e);
    }
  }
};

const setupSentry = () => {
  if (isProduction() || isStaging()) {
    Sentry.init({
      dsn:
        'https://5ff4c7c90a914032a0aee8cd3dd7b05e@o124058.ingest.sentry.io/5658431',
      environment: getEnvironment(),
      release: process.env.REACT_APP_RELEASE || 'unknown',
    });
  }
};

export const setupUserTracking = () => {
  setupSupportChat();
  setupSentry();
};
