import { trackEvent } from '@cognite/cdf-route-tracker';

export type Props = { [key: string]: string | number | boolean | Props | null };

export const trackUsage = (
  event: string,
  metadata?: { [key: string]: any }
) => {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { host } = window?.location;
  // eslint-disable-next-line no-unsafe-optional-chaining
  const { pathname } = window?.location;
  if (!host || !pathname) {
    return;
  }

  const pathWithoutTenant = pathname.substring(pathname.indexOf('/', 1));

  // eslint-disable-next-line lodash/prefer-includes
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
