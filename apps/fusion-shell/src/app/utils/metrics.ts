import { trackEvent } from '@cognite/cdf-route-tracker';
import { getProject } from '@cognite/cdf-utilities';

type Event =
  | { e: 'data.catalog.search.click'; searchText: string }
  | {
      e: 'data.catalog.search.filter.click';
      searchText?: string;
      filters?: string[];
    }
  | { e: 'data.catalog.search.resource.copy.id.click' }
  | { e: 'Navigation.Quick.Link.Click'; link?: string }
  | { e: 'Navigation.Quick.ViewAll.Click' }
  | { e: 'Navigation.Recent.Activity.Click'; app?: string }
  | { e: 'Navigation.View.Resource.Click'; resource: string; link: string }
  | { e: 'Navigation.AllApps.Search.Click'; searchText: string }
  | { e: 'Navigation.AllApps.Filter.Click'; filter: string }
  | { e: 'Navigation.AllApps.Navigate.App.Click'; app: string };

export const trackUsage = (event: Event) => {
  const { e, ...metadata } = event;

  const { host, pathname } = window?.location;
  if (!host || !pathname) {
    return;
  }

  const pathWithoutProjectName = pathname.substring(pathname.indexOf('/', 1));

  if (!host.includes('localhost')) {
    trackEvent(`Navigation.${e}`, {
      ...metadata,
      project: getProject(),
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: pathname,
      pathname: pathWithoutProjectName,
    });
  }
};
