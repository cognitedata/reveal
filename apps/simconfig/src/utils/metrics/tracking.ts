import { Metrics } from '@cognite/metrics';

import type { TrackingEventNames } from './constants';

const metrics = Metrics.create('SIMCONFIG');

const EXCLUDED_DOMAINS_FROM_TRACKING = Object.freeze([
  'localhost',
  'dev.fusion.cogniteapp.com',
]);

const isTrackingEnabledForDomain = () =>
  !EXCLUDED_DOMAINS_FROM_TRACKING.some((excludedDomain) =>
    window.location.href.includes(excludedDomain)
  );

const isStagingOrProductionEnv = () =>
  ['staging', 'production'].includes(process.env.REACT_APP_ENV ?? '');

const SHOULD_TRACK_METRICS = Boolean(
  process.env.REACT_APP_MIXPANEL_TOKEN &&
    isTrackingEnabledForDomain() &&
    isStagingOrProductionEnv()
);

export const identifyUser = (userId = 'unknown@org.com') => {
  if (SHOULD_TRACK_METRICS) {
    Metrics.identify(userId);
  }
};

export const trackUsage = (name: TrackingEventNames, properties?: object) => {
  if (!SHOULD_TRACK_METRICS) {
    return;
  }

  const { host, pathname } = window.location;

  if (!host || !pathname) {
    return;
  }

  const pathWithoutTenant = pathname.substring(pathname.indexOf('/', 1));

  metrics.track(name, {
    ...properties,
    appVersion: process.env.REACT_APP_VERSION_NAME,
    location: window.location.pathname,
    pathname: pathWithoutTenant,
  });
};
