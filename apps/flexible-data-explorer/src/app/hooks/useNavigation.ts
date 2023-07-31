import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { resourceItemToContainerReference } from '@fusion/industry-canvas';
import queryString from 'query-string';

// TODO: move these in fdx?
import { ResourceItem } from '@data-exploration-lib/core';

import { DateRange, ValueByDataType } from '../containers/Filter';
import { createSearchParams } from '../utils/router';

import { useGetChartsUrl, useGetCanvasUrl } from './useUrl';

// TODO: rename this could help, react-router also has a 'useNavigation'.
export const useNavigation = () => {
  const navigate = useNavigate();
  const { search, pathname } = useLocation(); // <-- current location being accessed
  const params = useParams();
  // const dataModelParams = useDataModelParams();
  const chartsUrl = useGetChartsUrl();
  const canvasUrl = useGetCanvasUrl();

  // For migration: if we're located at the route, keep the route
  // TODO: Better way to use navigate function to do this?
  const basename = useMemo(
    () => (pathname.startsWith('/explore') ? '/explore' : ''),
    [pathname]
  );

  // const basePath = useMemo(() => {
  //   const { space, dataModel, version } = params;
  //   return `${basename}/${dataModel}/${space}/${version}`;
  // }, [basename, params]);

  const toSearchPage = useCallback(
    (
      searchQuery: string = '',
      filters: ValueByDataType = {},
      options: {
        ignoreType?: boolean;
        enableAISearch?: boolean;
      } = {}
    ) => {
      const { type } = params;
      const { ignoreType = false, enableAISearch = false } = options;

      const queryParams = createSearchParams({
        searchQuery,
        filters,
        aiSearch: String(enableAISearch),
      });

      navigate({
        pathname: [basename, 'search', !ignoreType ? type : undefined]
          .filter((item) => item !== undefined)
          .join('/'),
        search: queryParams.toString(),
      });
    },
    [basename, params, navigate]
  );

  const toSearchCategoryPage = useCallback(
    (dataType?: string, cleanSearch?: boolean) => {
      navigate({
        pathname: [basename, `search`, dataType ? `${dataType}` : undefined]
          .filter((item) => item !== undefined)
          .join('/'),
        search: cleanSearch ? undefined : search,
      });
    },
    [basename, navigate, search]
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
      navigate(
        {
          pathname: `${basename}/${dataModel}/${space}/${version}`,
        },
        {
          replace: true,
        }
      );
    },
    [basename, navigate]
  );

  const toInstancePage = useCallback(
    (
      dataType: string,
      instanceSpace: string | undefined,
      externalId: string,
      {
        dataModel,
        space,
        version,
      }: {
        dataModel?: string;
        space?: string;
        version?: string;
      } = {}
    ) => {
      // const { space, dataModel, version } = params;

      // TODO: Clean me up
      const queryParams = new URLSearchParams(search);

      if (queryParams.has('expandedId')) {
        queryParams.delete('expandedId');
      }

      const pathname = [
        basename,
        dataModel,
        space,
        version,
        dataType,
        instanceSpace,
        externalId,
      ]
        .filter((item) => item !== undefined)
        .join('/');

      navigate({
        pathname,
        search: queryParams.toString(),
      });
    },
    [basename, navigate, search]
  );

  const toTimeseriesPage = useCallback(
    (externalId: string | number) => {
      navigate({
        pathname: `${basename}/timeseries/${externalId}`,
        search,
      });
    },
    [basename, navigate, search]
  );

  const toFilePage = useCallback(
    (externalId: string | number) => {
      navigate({
        pathname: `${basename}/file/${externalId}`,
        search,
      });
    },
    [basename, navigate, search]
  );

  const toLandingPage = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const toCharts = (timeseriesId: number, dateRange: DateRange) => {
    const queryObj = {
      timeserieIds: timeseriesId,
      startTime: dateRange[0].getTime(),
      endTime: dateRange[1].getTime(),
    };
    const query = queryString.stringify(queryObj);

    window.open(`${chartsUrl}&${query}`, '_blank');
  };

  const toCanvas = (item: ResourceItem) => {
    const initializeWithContainerReferences = btoa(
      JSON.stringify([resourceItemToContainerReference(item)])
    );

    const query = queryString.stringify({
      initializeWithContainerReferences,
    });

    window.open(`${canvasUrl}&${query}`, '_blank');
  };

  const goBack = useCallback(() => {
    navigate('..');
  }, [navigate]);

  return {
    toLandingPage,
    toSearchPage,
    toSearchCategoryPage,
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
