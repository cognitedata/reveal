import * as Sentry from '@sentry/react';
import mixpanel from 'mixpanel-browser';

import config from '../config/config';
import { isDevelopment, isProduction, isStaging } from '../utils/environment';

const mixpanelConfig = {
  prefix: 'Charts',
};

const shouldMixpanelTrack = isStaging || isProduction;

if (shouldMixpanelTrack) {
  mixpanel.init(config.mixpanelToken, { debug: isDevelopment });
} else {
  // eslint-disable-next-line no-console
  console.warn('Mixpanel token not present. No tracking will be done.');
}

export function trackUsage(eventName: string, properties = {}) {
  if (!shouldMixpanelTrack) return;
  if (!eventName) {
    throw new Error('Event Name is missing!');
  }

  const { host, pathname } = window.location;
  if (!(host || pathname)) {
    return;
  }
  const pathWithoutTenant = pathname.substring(pathname.indexOf('/', 1));
  mixpanel.track([mixpanelConfig.prefix, eventName].join('.'), {
    ...properties,
    appVersion: config.version,
    location: window.location.pathname,
    pathname: pathWithoutTenant,
  });
}

export function startTimer(eventName: string) {
  if (!shouldMixpanelTrack) return;
  if (!eventName) {
    throw new Error('Event Name is missing!');
  }

  mixpanel.time_event([mixpanelConfig.prefix, eventName].join('.'));
}

export function stopTimer(eventName: string, properties = {}) {
  if (!shouldMixpanelTrack) return;
  trackUsage(eventName, properties);
}

export const identifyUserForMetrics = (
  user:
    | {
        displayName?: string;
        givenName?: string;
        id: string;
        mail?: string;
        userPrincipalName?: string;
      }
    | undefined,
  project: string,
  cluster: string,
  azureADTenant?: string
) => {
  if (user) {
    if (shouldMixpanelTrack) {
      mixpanel.identify(user.mail || user.displayName || user.id);
      mixpanel.people.set({ $name: user.displayName, $email: user.mail });
      mixpanel.people.union('Projects', project);
      mixpanel.people.union('Clusters', cluster);
      if (azureADTenant)
        mixpanel.people.union('Azure AD Tenants', azureADTenant);
    }
    Sentry.setUser({
      email: user.mail,
      id: user.id,
      username: user.displayName,
    });
  }
};
