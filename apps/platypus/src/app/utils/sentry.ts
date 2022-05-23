import * as Sentry from '@sentry/browser';
import config from '../config/config';
import { environment } from '../../environments/environment';

if (
  config.SENTRY_DSN &&
  !['development', 'mock', 'fusion'].includes(environment.APP_ENV)
) {
  Sentry.init({
    dsn: config.SENTRY_DSN,
    // This is populated by the FAS build process. Change it if you want to
    // source this information from somewhere else.
    release: config.APP_RELEASE_ID,
    // This is populated by react-scripts. However, this can be overridden by
    // the app's build process if you wish.
    environment: environment.APP_ENV,
    debug: false,
    ignoreErrors: ['ResizeObserver loop limit exceeded'],
  });

  Sentry.setExtras({
    version: {
      name: config.APP_VERSION_NAME,
      sha: config.APP_VERSION_SHA,
      release: config.APP_RELEASE_ID,
    },
  });
}
