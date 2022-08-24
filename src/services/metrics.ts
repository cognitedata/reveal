import config from 'config/config';
import mixpanel from 'mixpanel-browser';
import { isDevelopment, isProduction, isStaging } from 'utils/environment';

const mixpanelConfig = {
  prefix: 'Charts',
};

if (config.mixpanelToken) {
  mixpanel.init(config.mixpanelToken, { debug: isDevelopment });
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
