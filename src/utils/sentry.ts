import * as Sentry from '@sentry/browser';
import { isProduction, isStaging } from 'utils/environment';

export function setupSentry() {
  if (isProduction() || isStaging()) {
    Sentry.init({
      dsn: 'https://0e9c21f42ca24bd8a836cbfff157c58b@sentry.io/2426453',
    });
  }
}
