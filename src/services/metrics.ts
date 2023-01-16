import config from 'config/config';
import mixpanel from 'mixpanel-browser';
import { isDevelopment, isProduction, isStaging } from 'utils/environment';
import { UserInfo } from 'hooks/useUserInfo';
import * as Sentry from '@sentry/react';

const mixpanelConfig = {
  prefix: 'Charts',
};

const { hostname } = window.location;
const isPreviewLink = hostname.includes('fusion-pr-preview');
const configToApply = { ...config };
if (!configToApply.mixpanelToken && isPreviewLink) {
  configToApply.mixpanelToken = '741a2c6ee88f7a1191cce6515493a541';
}
if (configToApply.mixpanelToken) {
  mixpanel.init(configToApply.mixpanelToken, { debug: isDevelopment });
} else if (isProduction || isStaging) {
  throw new Error('Mixpanel token must be present outside of development!');
} else {
  // eslint-disable-next-line no-console
  console.warn('Mixpanel token not present. No tracking will be done.');
}

export function trackUsage(eventName: string, properties = {}) {
  if (!config.mixpanelToken) return;
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
  if (!config.mixpanelToken) return;
  if (!eventName) {
    throw new Error('Event Name is missing!');
  }

  mixpanel.time_event([mixpanelConfig.prefix, eventName].join('.'));
}

export function stopTimer(eventName: string, properties = {}) {
  if (!config.mixpanelToken) return;
  trackUsage(eventName, properties);
}

export const identifyUserForMetrics = (
  user: UserInfo | undefined,
  project: string,
  cluster: string,
  azureADTenant?: string
) => {
  if (user) {
    if (config.mixpanelToken) {
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
