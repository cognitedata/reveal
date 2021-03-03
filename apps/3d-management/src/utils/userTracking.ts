import * as Sentry from '@sentry/browser';
import {
  getEnvironment,
  isDevelopment,
  checkUrl,
  isProduction,
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
  if (!checkUrl('dev')) {
    Sentry.init({
      dsn: 'https://d09f6d3557114e6cbaa63b56d7ef86cc@sentry.io/1288725',
      environment: getEnvironment(),
      release: process.env.REACT_APP_RELEASE || 'unknown',
    });
  }
};

export const setupUserTracking = () => {
  setupSupportChat();
  setupSentry();
};
