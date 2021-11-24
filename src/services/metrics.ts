import { Metrics } from '@cognite/metrics';
import * as Sentry from '@sentry/react';
import { UserInfo } from 'models/chart/types';
import { isDoNotTrackDomain } from 'utils/do-not-track';

export const metrics = Metrics.create('Charts');

export const shouldTrackMetrics = Boolean(
  process.env.REACT_APP_MIXPANEL_TOKEN &&
    !isDoNotTrackDomain() &&
    ['staging', 'production'].includes(process.env.REACT_APP_ENV || '')
);

export const identifyUser = (user: UserInfo) => {
  if (user && shouldTrackMetrics) {
    Metrics.identify(user.email || user.displayName || user.id);
    Sentry.setUser({
      email: user.email,
      id: user.id,
      username: user.displayName,
    });
  }
};

export const trackUsage = (name: string, properties?: any) => {
  if (!shouldTrackMetrics) {
    return;
  }

  const { host } = window?.location;
  const { pathname } = window?.location;
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
