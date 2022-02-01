import { Metrics } from '@cognite/metrics';

import type { TrackingEventNames } from './constants';

const metrics = Metrics.create('SIMCONFIG');

const domainsWithDoNotTrack = ['localhost'];

const isDoNotTrackDomain = () =>
  domainsWithDoNotTrack.some((doNotTrackDomain) =>
    window.location.href.includes(doNotTrackDomain)
  );

const SHOULD_TRACK_METRICS = Boolean(
  process.env.REACT_APP_MIXPANEL_TOKEN &&
    !isDoNotTrackDomain() &&
    ['staging', 'production'].includes(process.env.REACT_APP_ENV ?? '')
);

export const identifyUser = (emailId = 'unknown@org.com') => {
  if (emailId && SHOULD_TRACK_METRICS) {
    Metrics.identify(emailId);
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
