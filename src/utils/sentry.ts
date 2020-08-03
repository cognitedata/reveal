import * as Sentry from '@sentry/browser';
import { isProduction, isStaging } from 'utils/environment';

export function setupSentry() {
  if (isProduction() || isStaging()) {
    Sentry.init({
      dsn:
        'https://f980194af28742cc813b747266462b68@o124058.ingest.sentry.io/5375951',
    });
  }
}
