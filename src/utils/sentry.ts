import * as Sentry from '@sentry/browser';
import { isProduction, isStaging } from 'utils/environment';

export function setupSentry() {
  if (isProduction() || isStaging()) {
    Sentry.init({
      dsn:
        'https://5d7602da66cd4660a448eb2155167220@o124058.ingest.sentry.io/5375950',
    });
  }
}
