import mixpanel from 'mixpanel-browser';
import Config from 'models/charts/config/classes/Config';
import {
  isDevelopment,
  isProduction,
  isStaging,
} from 'models/charts/config/utils/environment';

const mixpanelConfig = {
  prefix: 'Charts',
};

if (Config.mixpanelToken) {
  mixpanel.init(Config.mixpanelToken, { debug: isDevelopment });
} else if (isProduction || isStaging) {
  throw new Error('Mixpanel token must be present outside of development!');
} else {
  // eslint-disable-next-line no-console
  console.warn('Mixpanel token not present. No tracking will be done.');
}

export function trackUsage(eventName: string, properties = {}) {
  if (!Config.mixpanelToken) return;
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
    appVersion: Config.version,
    location: window.location.pathname,
    pathname: pathWithoutTenant,
  });
}

export function startTimer(eventName: string) {
  if (!Config.mixpanelToken) return;
  if (!eventName) {
    throw new Error('Event Name is missing!');
  }

  mixpanel.time_event([mixpanelConfig.prefix, eventName].join('.'));
}

export function stopTimer(eventName: string, properties = {}) {
  if (!Config.mixpanelToken) return;
  trackUsage(eventName, properties);
}
