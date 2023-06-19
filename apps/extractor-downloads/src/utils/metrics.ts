import { trackEvent } from '@cognite/cdf-route-tracker';
import { getProject, isDevelopment } from '@cognite/cdf-utilities';
import { Metrics } from '@cognite/metrics';

export type MixpanelEvent =
  | { e: 'View.Extractor.Click'; name: string }
  | {
      e: 'Download.Extractor.Click';
      name?: string;
      version?: string;
      artifact?: string;
    }
  | {
      e: 'Documentation.Click';
      name?: string;
      document?: string;
      url?: string;
    }
  | {
      e: 'Versions.ViewAll.Click';
      name?: string;
    }
  | {
      e: 'Versions.Download.Click';
      name?: string;
      version?: string;
      artifact?: string;
    }
  | {
      e: 'Create.Extractor.Click';
    }
  | {
      e: 'Create.Extractor.Documentation.Click';
      document?: string;
      url?: string;
    }
  | {
      e: 'Search.Extractor';
      query?: string;
    };

export const trackUsage = (event: MixpanelEvent) => {
  const { e, ...metadata } = event;
  const { host, pathname } = window?.location;
  if (!host || !pathname) {
    return;
  }
  const pathWithoutTenant = pathname.substring(pathname.indexOf('/', 1));

  if (!host.includes('localhost')) {
    trackEvent(`ExtractData.${e}`, {
      ...metadata,
      project: getProject(),
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: pathname,
      pathname: pathWithoutTenant,
    });
  }
};

export const handleUserIdentification = (email: string) => {
  Metrics.identify(email || 'not-identified-yet');
  Metrics.people({
    email,
    name: email,
  });
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
