import { trackEvent } from '@cognite/cdf-route-tracker';

type Event =
  | { t: 'Create.DialogOpened' }
  | { t: 'Create.DialogClosed' }
  | { t: 'Create.Submit' }
  | { t: 'Create.Completed' }
  | { t: 'Create.Rejected'; error: string }
  | { t: 'Create.CreatePageLoaded' }
  | { t: 'EditField.Start'; field: string }
  | { t: 'EditField.Save'; field: string }
  | { t: 'EditField.Completed'; field: string }
  | { t: 'EditField.Cancel'; field: string }
  | { t: 'EditField.Rejected'; field: string }
  | { t: 'Sort'; field: string }
  | { t: 'Filter'; field: string; value: any }
  | { t: 'Search'; query: string }
  | { t: 'Action.Copy'; copyType: string }
  | { t: 'Overview' }
  | { t: 'Navigation'; href: string }
  | { t: 'Extraction pipeline.Details'; id: number }
  | { t: 'Extraction pipeline.Health'; id: number };

export const trackUsage = (event: Event) => {
  const { t, ...metadata } = event;
  const { host } = window?.location;
  const { pathname } = window?.location;
  if (!host || !pathname) {
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
  if (!host.includes('localhost')) {
    trackEvent(`Extpipes.${t}`, options);
  }
};
