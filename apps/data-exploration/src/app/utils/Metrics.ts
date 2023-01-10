import { trackEvent } from '@cognite/cdf-route-tracker';

export type Props = { [key: string]: string | number | boolean | Props | null };

export const trackUsage = (
  event: string,
  metadata?: { [key: string]: any }
) => {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { pathname } = window?.location;
  if (!pathname) {
    return;
  }
  const pathWithoutTenant = pathname.substring(pathname.indexOf('/', 1));

  const options = {
    ...metadata,
    version: 1,
    appVersion: process.env.REACT_APP_VERSION,
    location: window.location.pathname,
    pathname: pathWithoutTenant,
  };
  const eventName = `DataExplorer.${event}`;
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('Metrics.track', { eventName, ...options });
  }

  trackEvent(eventName, options);
};
