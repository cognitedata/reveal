import { useEffect } from 'react';

import { CdfUserHistoryService, useCdfUserHistoryService } from '@user-history';

import { trackEvent } from '@cognite/cdf-route-tracker';

import { rawAppsData } from '../../sections/sections';

import TopBar from './TopBar';

const onSingleSpaRouterEvent = (userHistoryService: CdfUserHistoryService) => {
  const { hash, host, pathname, hostname, origin } = window.location;

  const subApp = (() => {
    try {
      const pathElems = pathname.split('/');
      const subAppPathPosition = 2;
      const newRoutePath = pathElems
        .slice(subAppPathPosition, pathElems.length)
        .join('/');

      // Hacky solution to check if the navigated path is sub app's route path
      // if it is, we log the sub app's route path as usedApplication resource in user history
      // Also, there are few sub apps that have the route path starts with same text,
      // so we sort the rawAppsData by linkTo length to get the most specific sub app
      let sortRawAppsDataByLinkToLength = [...rawAppsData];
      sortRawAppsDataByLinkToLength = sortRawAppsDataByLinkToLength.sort(
        (app1, app2) => app2?.linkTo?.length - app1?.linkTo?.length
      );
      const navigatedApp = sortRawAppsDataByLinkToLength.find((appItem) =>
        `/${newRoutePath}`.startsWith(appItem?.linkTo)
      );

      return {
        internalId: navigatedApp ? navigatedApp?.internalId : 'navigation',
        linkTo: navigatedApp ? navigatedApp?.linkTo : '',
      };
    } catch {
      return {
        internalId: 'unknown',
        linkTo: '',
      };
    }
  })();

  if (
    userHistoryService &&
    subApp &&
    subApp?.internalId !== 'unknown' &&
    subApp?.internalId !== 'navigation'
  ) {
    // subAppPath is sub app link configured in sections as linkTo
    userHistoryService.logNewApplicationUsage(subApp?.linkTo);
  }

  trackEvent('Routing.Change', {
    app: subApp?.internalId,
    hash,
    host,
    pathname,
    hostname,
    origin,
  });
};

type NavigationProps = {
  isReleaseBanner: string;
  setReleaseBanner: (value: string) => void;
};

const Navigation = (props: NavigationProps) => {
  const userHistoryService = useCdfUserHistoryService();

  useEffect(() => {
    trackEvent('ApplicationStart');
    const handler = () => {
      onSingleSpaRouterEvent(userHistoryService);
    };
    window.addEventListener('single-spa:routing-event', handler);
    return () => {
      window.removeEventListener('single-spa:routing-event', handler);
    };
  }, [userHistoryService]);

  return <TopBar {...props} />;
};

export default Navigation;
