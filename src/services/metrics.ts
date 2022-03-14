import mixpanel from 'mixpanel-browser';
import { isDevelopment, isProduction, isStaging } from 'utils/environment';

export const mixpanelToken = process.env.REACT_APP_MIXPANEL_TOKEN;

const config = {
  prefix: 'Charts',
  doNotTrackDomains: ['statnett.cogniteapp.com', 'power-no.cogniteapp.com'],
  disableTracking: isDevelopment, // You can choose to enable tracking in development commenting this line
};

// Do-not-track is only valid for mixpanel.
// Sentry is categorized as legitimate tracking in order to provide good support
function isDoNotTrackDomain() {
  const { doNotTrackDomains } = config;
  return (
    Array.isArray(doNotTrackDomains) &&
    doNotTrackDomains.length > 0 &&
    doNotTrackDomains.some((domain) => window.location.href.includes(domain))
  );
}

if (mixpanelToken) {
  mixpanel.init(mixpanelToken, { debug: isDevelopment });
  // Automates do-not-track
  if (config.disableTracking || isDoNotTrackDomain()) {
    mixpanel.opt_out_tracking();
  }
} else if (isProduction || isStaging) {
  throw new Error('Mixpanel token must be present outside of development!');
} else {
  // eslint-disable-next-line no-console
  console.warn('Mixpanel token not present. No tracking will be done.');
}

export function trackUsage(eventName: string, properties = {}) {
  if (!mixpanelToken) return;
  if (!eventName) {
    throw new Error('Event Name is missing!');
  }

  const { host, pathname } = window.location;
  if (!(host || pathname)) {
    return;
  }
  const pathWithoutTenant = pathname.substring(pathname.indexOf('/', 1));
  mixpanel.track([config.prefix, eventName].join('.'), {
    ...properties,
    appVersion: process.env.REACT_APP_VERSION_NAME,
    location: window.location.pathname,
    pathname: pathWithoutTenant,
  });
}

export function startTimer(eventName: string) {
  if (!mixpanelToken) return;
  if (!eventName) {
    throw new Error('Event Name is missing!');
  }

  mixpanel.time_event([config.prefix, eventName].join('.'));
}

export function stopTimer(eventName: string, properties = {}) {
  if (!mixpanelToken) return;
  trackUsage(eventName, properties);
}
