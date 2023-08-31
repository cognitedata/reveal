import { useCallback, useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { ContainerReference } from '@fusion/industry-canvas';
import queryString from 'query-string';

import { DateRange, ValueByDataType } from '../containers/Filter';
import { createSearchParams } from '../utils/router';

import { ViewMode, useViewModeParams } from './useParams';
import { useGetChartsUrl, useGetCanvasUrl } from './useUrl';

// TODO: rename this could help, react-router also has a 'useNavigation'.
export const useNavigation = () => {
  const navigate = useNavigate();
  const { search, pathname } = useLocation(); // <-- current location being accessed
  const params = useParams();
  const [viewMode] = useViewModeParams();
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
        viewMode?: ViewMode;
      } = {}
    ) => {
      const { type } = params;
      const { ignoreType = false, enableAISearch = false } = options;

      const queryParams = createSearchParams({
        searchQuery,
        filters,
        aiSearch: String(enableAISearch),
        viewMode: options.viewMode || viewMode,
      });

      navigate({
        pathname: [basename, 'search', !ignoreType ? type : undefined]
          .filter((item) => item !== undefined)
          .join('/'),
        search: queryParams.toString(),
      });
    },
    [basename, params, navigate, viewMode]
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

  const toGenericPage = useCallback(
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
      } = {},
      options: {
        viewMode?: ViewMode;
      } = {}
    ) => {
      const queryParams = new URLSearchParams(search);
      // Assure that we are looking at the dashboard of the instance
      queryParams.set('viewMode', options.viewMode ?? 'list');

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
    (externalId?: string | number) => {
      if (externalId === undefined) {
        return;
      }

      const queryParams = new URLSearchParams(search);

      if (queryParams.has('expandedId')) {
        queryParams.delete('expandedId');
      }

      navigate({
        pathname: `${basename}/timeseries/${externalId}`,
        search: queryParams.toString(),
      });
    },
    [basename, navigate, search]
  );

  const toFilePage = useCallback(
    (externalId?: string | number) => {
      if (externalId === undefined) {
        return;
      }

      const queryParams = new URLSearchParams(search);

      if (queryParams.has('expandedId')) {
        queryParams.delete('expandedId');
      }

      navigate({
        pathname: `${basename}/file/${externalId}`,
        search: queryParams.toString(),
      });
    },
    [basename, navigate, search]
  );

  const toSequencePage = useCallback(
    (externalId: string | number) => {
      const queryParams = new URLSearchParams(search);

      if (queryParams.has('expandedId')) {
        queryParams.delete('expandedId');
      }

      navigate({
        pathname: `${basename}/sequence/${externalId}`,
        search: queryParams.toString(),
      });
    },
    [basename, navigate, search]
  );

  const toInstancePage = useCallback(
    (
      dataType?: string,
      instanceSpace?: string | undefined,
      externalId?: string,
      dataModel: {
        dataModel?: string;
        space?: string;
        version?: string;
      } = {},
      options: {
        viewMode?: ViewMode;
      } = {}
    ) => {
      if (
        dataType === undefined ||
        externalId === undefined ||
        instanceSpace === undefined
      ) {
        console.error('Missing parameters to navigate to instance page');
        return;
      }

      if (dataType === 'File') {
        return toFilePage(externalId);
      }

      if (dataType === 'TimeSeries') {
        return toTimeseriesPage(externalId);
      }

      if (dataType === 'Sequence') {
        return toSequencePage(externalId);
      }

      return toGenericPage(
        dataType,
        instanceSpace,
        externalId,
        dataModel,
        options
      );
    },
    [toFilePage, toGenericPage, toSequencePage, toTimeseriesPage, search]
  );

  const toLandingPage = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const toCharts = (timeseriesId: number, dateRange?: DateRange) => {
    const queryObj = {
      timeserieIds: timeseriesId,
      startTime: dateRange ? dateRange[0].getTime() : undefined,
      endTime: dateRange ? dateRange[1].getTime() : undefined,
    };
    const query = queryString.stringify(queryObj);

    window.open(`${chartsUrl}&${query}`, '_blank');
  };

  const toCanvas = (containerReference: ContainerReference) => {
    // Fix the 'any'...
    const initializeWithContainerReferences = btoa(
      JSON.stringify([containerReference])
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
    toSequencePage,

    toCharts,
    toCanvas,

    goBack,
  };
};
