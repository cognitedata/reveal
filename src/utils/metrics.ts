import { trackEvent } from '@cognite/cdf-route-tracker';
import { getProject, isDevelopment } from '@cognite/cdf-utilities';
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

  if (!host.includes('localhost')) {
    trackEvent(`data-sets.${event}`, {
      ...metadata,
      project: getProject(),
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: pathname,
      user: username,
      pathname: pathWithoutProjectName,
    });
  }
};

export const setupMixpanel = () => {
  const mixpanelFusionToken = '5c4d853e7c3b77b1eb4468d5329b278c'; // pragma: allowlist secret
  const mixpanelFusionDevToken = '643d35354aa468504d01f2dd33d8f726'; // pragma: allowlist secret

  const mixpanelToken = isDevelopment()
    ? mixpanelFusionDevToken
    : mixpanelFusionToken;

  Metrics.init({
    mixpanelToken,
    debug: isDevelopment(),
  });

  // We opt out of tracking if we are on development
  if (isDevelopment()) {
    Metrics.optOut();
  } else {
    Metrics.optIn();
  }
};

export const handleUserIdentification = (email: string) => {
  Metrics.identify(email || 'not-identified-yet');
  Metrics.people({
    email,
    name: email,
  });
};
