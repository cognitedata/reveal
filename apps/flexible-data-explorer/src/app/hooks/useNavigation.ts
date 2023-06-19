import { useCallback, useMemo } from 'react';
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { resourceItemToContainerReference } from '@fusion/industry-canvas';
import queryString from 'query-string';

import { createLink } from '@cognite/cdf-utilities';

// TODO: move these in fdx?
import { ResourceItem, ResourceType } from '@data-exploration-lib/core';

import { DateRange, ValueByDataType } from '../containers/search/Filter';

import { useSearchFilterParams, useSearchQueryParams } from './useParams';

// TODO: rename this could help, react-router also has a 'useNavigation'.
export const useNavigation = () => {
  const navigate = useNavigate();
  const { search, pathname } = useLocation(); // <-- current location being accessed
  const params = useParams();
  const [_, setQueryParams] = useSearchQueryParams();
  const [__, setFilterParams] = useSearchFilterParams();

  // For migration: if we're located at the route, keep the route
  // TODO: Better way to use navigate function to do this?
  const basename = useMemo(
    () => (pathname.startsWith('/explore') ? '/explore' : ''),
    [pathname]
  );

  const basePath = useMemo(() => {
    const { space, dataModel, version } = params;
    return `${basename}/${dataModel}/${space}/${version}`;
  }, [basename, params]);

  const toSearchPage = useCallback(
    (searchQuery: string = '', filters: ValueByDataType = {}) => {
      const params = createSearchParams({
        searchQuery,
        filters: JSON.stringify(filters),
      });

      setQueryParams(searchQuery);
      setFilterParams(filters);

      navigate({
        pathname: `search`,
        search: `?${params.toString()}`,
      });
    },
    [basename, navigate]
  );

  const redirectSearchPage = useCallback(
    (dataType?: string) => {
      navigate({
        pathname: [`${basePath}/search`, dataType && `/${dataType}`]
          .filter(Boolean)
          .join(''),
        search,
      });
    },
    [basePath, navigate, search]
  );

  // NOTE: this is gonna be removed, there will be no list pages, only search results.
  const toListPage = useCallback(
    (space: string, dataModel: string, version: string, dataType: string) => {
      navigate({
        pathname: `${basename}/${dataModel}/${space}/${version}/list/${dataType}`,
        // search: `?searchQuery=${query}`,
      });
    },
    [basename, navigate]
  );

  const toHomePage = useCallback(
    (space: string, dataModel: string, version: string) => {
      navigate({
        pathname: `${basename}/${dataModel}/${space}/${version}`,
      });
    },
    [basename, navigate]
  );

  const toInstancePage = useCallback(
    (
      dataType: string,
      instanceSpace: string | undefined,
      externalId: string
    ) => {
      const { space, dataModel, version } = params;
      navigate({
        pathname: `${basename}/${dataModel}/${space}/${version}/${dataType}/${instanceSpace}/${externalId}`,
        search,
      });
    },
    [basename, navigate, params, search]
  );

  const toTimeseriesPage = useCallback(
    (externalId: string | number) => {
      const { space, dataModel, version } = params;
      navigate({
        pathname: `${basename}/${dataModel}/${space}/${version}/timeseries/${externalId}`,
        search,
      });
    },
    [basename, navigate, params, search]
  );

  const toFilePage = useCallback(
    (externalId: string | number) => {
      const { space, dataModel, version } = params;
      navigate({
        pathname: `${basename}/${dataModel}/${space}/${version}/file/${externalId}`,
        search,
      });
    },
    [basename, navigate, params, search]
  );

  const toLandingPage = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const toCharts = useCallback(
    (timeseriesId: number, dateRange: DateRange) => {
      const queryObj = {
        timeseriesIds: timeseriesId,
        startTime: dateRange[0].getTime(),
        endTime: dateRange[1].getTime(),
      };
      const query = queryString.stringify(queryObj);

      navigate(`/charts?${query}`);
    },
    [navigate]
  );

  const toCanvas = useCallback(
    (item: ResourceItem) => {
      const initializeWithContainerReferences = btoa(
        JSON.stringify([resourceItemToContainerReference(item)])
      );

      const query = queryString.stringify({
        initializeWithContainerReferences,
      });

      navigate(`/canvas?${query}`);
    },
    [navigate]
  );

  const goBack = useCallback(() => {
    navigate('..');
  }, [navigate]);

  return {
    toLandingPage,
    toSearchPage,
    redirectSearchPage,
    toListPage,
    toHomePage,

    toInstancePage,
    toTimeseriesPage,
    toFilePage,

    toCharts,
    toCanvas,

    goBack,
  };
};
