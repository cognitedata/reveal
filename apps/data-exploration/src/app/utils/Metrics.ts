import { trackEvent } from '@cognite/cdf-route-tracker';

export type Props = { [key: string]: string | number | boolean | Props | null };

export const trackUsage = (
  event: string,
  metadata?: { [key: string]: any }
) => {
  const { host } = window?.location;
  const { pathname } = window?.location;
  if (!host || !pathname) {
    return;
  }

  const pathWithoutTenant = pathname.substring(pathname.indexOf('/', 1));

  if (host.indexOf('localhost') === -1) {
    trackEvent(`DataExplorer.${event}`, {
      ...metadata,
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: window.location.pathname,
      pathname: pathWithoutTenant,
    });
  }
};
