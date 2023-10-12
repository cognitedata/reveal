import React, { useEffect, useRef } from 'react';
import {
  useParams,
  useLocation,
  useNavigate,
  Location,
  NavigateFunction,
  NavigateOptions,
  To,
} from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import isArray from 'lodash/isArray';
import qs from 'query-string';

import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import { ResourceItem, ResourceType } from '@cognite/data-exploration';

import { trackUsage } from '../utils/Metrics';
import { getSearchParams } from '../utils/URLUtils';

const opts: { arrayFormat: 'comma' } = { arrayFormat: 'comma' };

// TODO: Refactor this whole file into separate files

const getSetItems =
  (
    key: string,
    push: boolean,
    location: Location,
    navigate: NavigateFunction
  ) =>
  (newItems: string | string[]) => {
    const search = getSearchParams(location.search);

    navigate(
      {
        pathname: location.pathname,
        search: qs.stringify(
          {
            ...search,
            [key]: Array.isArray(newItems)
              ? newItems
              : encodeURIComponent(newItems),
          },
          { ...opts, skipNull: true, skipEmptyString: true }
        ),
      },
      { replace: !push }
    );
  };

export function useQueryString(
  key: string,
  push = true
): [string, (_: string) => void] {
  const location = useLocation();
  const navigate = useNavigate();

  const search = getSearchParams(location.search);
  const item = (search[key] || '') as string;

  const queryString = React.useMemo(() => decodeURIComponent(item), [item]);

  return [queryString, getSetItems(key, push, location, navigate)];
}

export const useCurrentSearchResourceTypeFromLocation = () => {
  const location = useLocation();
  // sample path1: "/dss-dev/explore/search/asset"
  // sample path2: "/dss-dev/explore/search/asset/:asset-id"
  // sample path3: "/dss-dev/explore/search/asset/:asset-id/asset"
  // sample path4: "/dss-dev/explore/search/timeSeries/:timerseries-id/asset/:asset-id/asset"

  const path = location.pathname;

  const splittedPath = path.split('/');

  const getPossibleResourceTypeIndex = (baseNumberOfSplittedPath: number) =>
    baseNumberOfSplittedPath;

  if (
    splittedPath.includes('search') &&
    splittedPath.length >= getPossibleResourceTypeIndex(5)
  ) {
    return splittedPath[getPossibleResourceTypeIndex(5) - 1] as ResourceType;
  }

  // sample path: "/dss-dev/explore/asset/123123123/asset"

  if (
    !splittedPath.includes('search') &&
    splittedPath.length >= getPossibleResourceTypeIndex(4)
  ) {
    return splittedPath[getPossibleResourceTypeIndex(4) - 1] as ResourceType;
  }

  return undefined;
};

// NOTE: We updated navigation flows and url patterns. ...
// ... https://cognitedata.atlassian.net/wiki/spaces/DEGEXP/pages/3957457213/Data+Explorer+Navigation+revamp+work
// ... Check and use hooks under `./detailsNavigation` for the most relevant navigation patterns.
export const useCurrentResourceType = (): [
  ResourceType | undefined,
  (type?: ResourceType, resourceId?: number) => void
] => {
  const navigate = useNavigate();
  const location = useLocation();

  // Here we can not use useParams, because SearchResultsPageV2 do not know about
  // dynamic routes anymore like `:resourceType`. This is hopefuly a temporary solution.
  const resourceType = useCurrentSearchResourceTypeFromLocation();

  const setCurrentResourceType = React.useCallback(
    (newResourceType?: ResourceType, resourceId?: number) => {
      const search = getSearchParams(location.search);

      navigate(
        createLink(
          [
            '/explore/search',
            newResourceType && `/${newResourceType}`,
            resourceId && `/${resourceId}`,
          ]
            .filter(Boolean)
            .join(''),
          search,
          opts
        )
      );
    },
    [location.search, navigate]
  );

  return [resourceType, setCurrentResourceType];
};

// NOTE: We updated navigation flows and url patterns. ...
// ... https://cognitedata.atlassian.net/wiki/spaces/DEGEXP/pages/3957457213/Data+Explorer+Navigation+revamp+work
// ... Check and use hooks under `./detailsNavigation` for the most relevant navigation patterns.
export const useSelectedResourceId = (
  isRootAsset = false
): number | undefined => {
  const params = useParams();
  const selectedRoute = params['*'];
  const splittedParams = selectedRoute?.split('/');
  // :id -> index 0 for resource's own detail
  // :baseResourceId/asset/:id -> index 2 for resource's root asset detail
  const resourceIdIndex = isRootAsset ? 2 : 0;

  if (splittedParams && splittedParams.length > 0) {
    return Number.isFinite(parseInt(splittedParams[resourceIdIndex], 10))
      ? parseInt(splittedParams[resourceIdIndex], 10)
      : undefined;
  }

  return undefined;
};

// NOTE: We updated navigation flows and url patterns. ...
// ... https://cognitedata.atlassian.net/wiki/spaces/DEGEXP/pages/3957457213/Data+Explorer+Navigation+revamp+work
// ... Check and use hooks under `./detailsNavigation` for the most relevant navigation patterns.
export const useCurrentResourceId = (): [
  number | undefined,
  (
    resourceId?: number,
    replace?: boolean,
    extraResourceType?: ResourceType,
    extraResourceId?: number,
    resourceType?: ResourceType
  ) => void
] => {
  const [type] = useCurrentResourceType();
  const navigate = useNavigate();
  const location = useLocation();

  const { id, tabType } = useParams<{
    id: string;
    tabType?: string;
  }>();
  const idNumber =
    !!id && Number.isFinite(parseInt(id, 10)) ? parseInt(id, 10) : undefined;

  const setCurrentResourceId = (
    resourceId?: number,
    replaceHistory = false,
    extraResourceType?: ResourceType,
    extraResourceId?: number,
    resourceType?: ResourceType
  ) => {
    const currentResourceType = type || resourceType;
    const search = getSearchParams(location.search);

    if (!resourceId) {
      navigate(createLink(`/explore/search/${type}`, search, opts), {
        replace: replaceHistory,
      });
    } else {
      // Use this to navigate to a different resource type details on the preview than the current resource type.
      if (extraResourceType && currentResourceType && extraResourceId) {
        navigate(
          createLink(
            `/explore/search/${currentResourceType}/${resourceId}/${extraResourceType}/${extraResourceId}`,
            search,
            opts
          ),
          { replace: replaceHistory }
        );
      } else {
        navigate(
          createLink(
            `/explore/search/${currentResourceType}/${resourceId}${
              tabType ? `/${tabType}` : ''
            }`,
            search,
            opts
          ),
          { replace: replaceHistory }
        );
      }
    }
  };
  return [idNumber, setCurrentResourceId];
};

export const useUserInformation = () => {
  return useQuery(['user-info'], getUserInformation);
};

// NOTE: We updated navigation flows and url patterns. ...
// ... https://cognitedata.atlassian.net/wiki/spaces/DEGEXP/pages/3957457213/Data+Explorer+Navigation+revamp+work
// ... Check and use hooks under `./detailsNavigation` for the most relevant navigation patterns.
/**
 * Create the function which helps to persist the search string and create the relative link in the navigation in preview mode
 * @param tabType the type of the tab
 * @param type Resource type of the navigator
 */
export const useOnPreviewTabChange = (tabType?: string, type?: string) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (newTab: string) => {
    navigate(
      createLink(
        `/${location.pathname
          .split('/')
          .slice(2, tabType ? -1 : undefined)
          .join('/')}/${newTab}`,
        qs.parse(location.search)
      ),
      {
        state: { history: location.state?.history },
        replace: true,
      }
    );
    trackUsage('Exploration.Details.TabChange', {
      type,
      tab: newTab,
    });
  };
};

/**
 * Returns a navigate function that keeps track of location history
 * The history array is used to populate breadcrumbs in the details view
 */
export const useNavigateWithHistory = (
  resource: ResourceItem & { title: string }
) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (to: To, options?: NavigateOptions) => {
    navigate(to, {
      ...options,
      state: {
        ...options?.state,
        history: isArray(location.state?.history)
          ? [...location.state.history, { path: location.pathname, resource }]
          : [{ path: location.pathname, resource }],
      },
    });
  };
};

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  return ref.current;
}
