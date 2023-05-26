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

import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';
import { useQuery } from '@tanstack/react-query';
import isArray from 'lodash/isArray';
import qs from 'query-string';

import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import { ResourceItem, ResourceType } from '@cognite/data-exploration';

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
          opts
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

const emptyArray = [] as string[];
export function useQueryStringArray(
  key: string,
  push = true
): [string[], (_: any[]) => void] {
  const location = useLocation();
  const navigate = useNavigate();

  const search = qs.parse(location?.search, opts);
  const rawItems = search[key];
  if (!rawItems) {
    return [emptyArray, getSetItems(key, push, location, navigate)];
  }
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return [items, getSetItems(key, push, location, navigate)];
}

export const useCurrentSearchResourceTypeFromLocation = () => {
  const location = useLocation();
  // sample path1: "/dss-dev/explore/search/asset"
  // sample path2: "/dss-dev/explore/search/asset/:asset-id"
  // sample path3: "/dss-dev/explore/search/asset/:asset-id/asset"
  // sample path4: "/dss-dev/explore/search/timeSeries/:timerseries-id/asset/:asset-id/asset"
  const path = location.pathname;

  const splittedPath = path.split('/');
  if (splittedPath.includes('search') && splittedPath.length >= 5) {
    // TODO: try to get rid of `ResourceType` type later!
    return splittedPath[4] as ResourceType;
  }

  // sample path: "/dss-dev/explore/asset/123123123/asset"
  if (!splittedPath.includes('search') && splittedPath.length >= 4) {
    return splittedPath[3] as ResourceType;
  }

  return undefined;
};

// TODO: try to get rid of `ResourceType` type later!
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
