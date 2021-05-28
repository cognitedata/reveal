import { Metrics } from '@cognite/metrics';
import { Dict } from 'mixpanel-browser';

export const metrics = Metrics.create('Charts');

export const trackUsage = (name: string, properties?: Dict) => {
  const { host } = window?.location;
  const { pathname } = window?.location;
  if (!host || !pathname) {
    return;
  }

  const pathWithoutTenant = pathname.substring(pathname.indexOf('/', 1));

  if (host.indexOf('localhost') === -1) {
    metrics.track(name, {
      ...properties,
      appVersion: process.env.REACT_APP_VERSION_NAME,
      location: window.location.pathname,
      pathname: pathWithoutTenant,
    });
  }
};
