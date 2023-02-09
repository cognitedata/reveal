import { Metrics } from '@cognite/metrics';

import sidecar from 'utils/sidecar';

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
  sidecar.mixpanel && isTrackingEnabledForDomain() && isStagingOrProductionEnv()
);

export const identifyUser = ({
  userId = 'unknown@org.com',
  project = 'unknownProject',
  email = 'unknown@org.com',
}) => {
  if (SHOULD_TRACK_METRICS) {
    const {
      REACT_APP_RELEASE: release = 'release',
      REACT_APP_VERSION_NAME: versionName = '0.0.0',
      REACT_APP_VERSION_SHA: build = 'development',
    } = process.env;

    Metrics.init({
      applicationId: sidecar.applicationId,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mixpanelToken: sidecar.mixpanel!,
      userId,
      release,
      versionName,
      build,
      tenant: project,
    });
    Metrics.identify(userId);
    Metrics.props({
      tenant: project,
    });

    if (email) {
      Metrics.people({
        name: email,
        $email: email,
      });
    }
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
