import * as Sentry from '@sentry/browser';
import debounce from 'lodash/debounce';

import { getProject, getEnvironment } from '@cognite/cdf-utilities';

export const getSubapp = () =>
  new URL(window.location.href).pathname.split('/')[2];

const isValidDomain = (domain: string) => {
  return (
    window?.location?.hostname === domain ||
    window?.location?.hostname?.split('.').slice(1).join('.') === domain
  );
};
const isProduction = () => isValidDomain('fusion.cognite.com');
const isStaging = () => isValidDomain('next-release.fusion.cognite.com');

export function setupSentry() {
  if (isProduction() || isStaging()) {
    const beforeSend = debounce((event: Sentry.Event) => {
      event.tags = {
        ...event.tags,
        project: getProject(),
        cluster: getEnvironment(),
        subApp: getSubapp(),
        staging: isStaging(),
      };
      return event;
    }, 1000);

    Sentry.init({
      dsn: 'https://e1b43d071a3446bfabfca7d239864bc1@o124058.ingest.sentry.io/5177031',
      // @ts-ignore
      beforeSend,
    });
  }
}
