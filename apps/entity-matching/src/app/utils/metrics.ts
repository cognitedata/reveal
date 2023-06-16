import { trackEvent } from '@cognite/cdf-route-tracker';
import { getProject } from '@cognite/cdf-utilities';
import { Metrics } from '@cognite/metrics';

export const trackUsage = (
  event: string,
  username?: string,
  metadata?: { [key: string]: any }
) => {
  const { host, pathname } = window?.location;
  if (!host || !pathname) {
    return;
  }

  const pathWithoutProjectName = pathname.substring(pathname.indexOf('/', 1));
  const customerDomain = window.location.host.split('.')[0];

  if (!host.includes('localhost')) {
    trackEvent(`entity-matching.${event}`, {
      ...metadata,
      project: getProject(),
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: pathname,
      user: username,
      pathname: pathWithoutProjectName,
      customerDomain,
      host,
    });
  }
};

export const setupMixpanel = () => {
  const mixpanelFusionToken = '5c4d853e7c3b77b1eb4468d5329b278c'; // pragma: allowlist secret

  Metrics.init({ mixpanelFusionToken } as any);
};
