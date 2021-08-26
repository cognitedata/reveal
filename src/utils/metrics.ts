import { Metrics } from '@cognite/metrics';
import { UserInfo } from 'reducers/charts/types';
import * as Sentry from '@sentry/react';

export const metrics = Metrics.create('Charts');

export const identifyUser = (user: UserInfo) => {
  if (user) {
    Metrics.identify(user.email || user.displayName || user.id);
    Sentry.setUser({
      email: user.email,
      id: user.id,
      username: user.displayName,
    });
  }
};

export const trackUsage = (name: string, properties?: any) => {
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
