import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import queryString from 'query-string';

import { DateRange, ValueByDataType } from '../containers/Filter';
import { Instance } from '../services/types';
import { ContainerReference } from '../types';
import { createSearchParams, splitPathAndParams } from '../utils/router';

import { useLinks } from './useLinks';
import {
  ViewMode,
  useSelectedInstanceParams,
  useViewModeParams,
} from './useParams';

// TODO: gradually move the navigation logic from this hook to 'Link'.

export const useNavigation = () => {
  const navigate = useNavigate();
  const { search } = useLocation(); // <-- current location being accessed
  const [viewMode] = useViewModeParams();
  const [selectedInstance] = useSelectedInstanceParams();

  const {
    homePageLink,
    searchPageLink,
    instancePageLink,
    filePageLink,
    timeseriesPageLink,
    sequencePageLink,
    canvasAppLink,
    chartsAppLink,
  } = useLinks();

  const toSearchPage = useCallback(
    (
      searchQuery: string = '',
      filters: ValueByDataType = {},
      options: {
        category?: string;
        ignoreType?: boolean;
        enableAISearch?: boolean;
        viewMode?: ViewMode;
        selectedInstance?: Instance;
      } = {}
    ) => {
      const type = options.category;

      const { ignoreType = false, enableAISearch = false } = options;

      const queryParams = createSearchParams({
        searchQuery,
        searchCategory: !ignoreType ? type : undefined,
        filters,
        aiSearch: String(enableAISearch),
        viewMode: options.viewMode ?? viewMode,
        selectedInstance: options.selectedInstance ?? selectedInstance,
      });

      const baseLink = splitPathAndParams(searchPageLink());
      baseLink.params.forEach((val, key) => queryParams.append(key, val));

      navigate({
        pathname: baseLink.path,
        search: queryParams.toString(),
      });
    },
    [searchPageLink, navigate, viewMode]
  );

  const toHomePage = useCallback(
    (space: string, dataModel: string, version: string) => {
      navigate(
        homePageLink({
          externalId: dataModel,
          space,
          version,
        }),
        {
          replace: true,
        }
      );
    },
    [homePageLink, navigate]
  );

  const toGenericPage = useCallback(
    (
      dataType?: string,
      instanceSpace?: string | undefined,
      externalId?: string,
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
      if (
        dataType === undefined ||
        externalId === undefined ||
        instanceSpace === undefined
      ) {
        console.error('Missing parameters to navigate to instance page');
        return;
      }

      const queryParams = new URLSearchParams(search);
      // Assure that we are looking at the dashboard of the instance
      queryParams.set('viewMode', options.viewMode ?? 'list');

      const baseLink = splitPathAndParams(
        instancePageLink(
          {
            externalId: dataModel,
            space,
            version,
          },
          {
            dataType,
            instanceSpace,
            externalId,
          }
        )
      );
      baseLink.params.forEach((val, key) => queryParams.append(key, val));

      navigate({
        pathname: baseLink.path,
        search: queryParams.toString(),
      });
    },
    [instancePageLink, navigate, search]
  );

  const toTimeseriesPage = useCallback(
    (externalId?: string | number) => {
      if (externalId === undefined) {
        console.error("Missing 'externalId' to navigate to timeseries page");
        return;
      }

      const queryParams = new URLSearchParams(search);

      if (queryParams.has('expandedId')) {
        queryParams.delete('expandedId');
      }

      const baseLink = splitPathAndParams(timeseriesPageLink(externalId));
      baseLink.params.forEach((val, key) => queryParams.append(key, val));

      navigate({
        pathname: baseLink.path,
        search: queryParams.toString(),
      });
    },
    [timeseriesPageLink, navigate, search]
  );

  const toFilePage = useCallback(
    (externalId?: string | number) => {
      if (externalId === undefined) {
        console.error("Missing 'externalId' to navigate to file page");
        return;
      }

      const queryParams = new URLSearchParams(search);

      if (queryParams.has('expandedId')) {
        queryParams.delete('expandedId');
      }

      const baseLink = splitPathAndParams(filePageLink(externalId));
      baseLink.params.forEach((val, key) => queryParams.append(key, val));

      navigate({
        pathname: baseLink.path,
        search: queryParams.toString(),
      });
    },
    [filePageLink, navigate, search]
  );

  const toSequencePage = useCallback(
    (externalId?: string | number) => {
      if (externalId === undefined) {
        console.error("Missing 'externalId' to navigate to sequence page");
        return;
      }

      const queryParams = new URLSearchParams(search);

      if (queryParams.has('expandedId')) {
        queryParams.delete('expandedId');
      }

      const baseLink = splitPathAndParams(sequencePageLink(externalId));
      baseLink.params.forEach((val, key) => queryParams.append(key, val));

      navigate({
        pathname: baseLink.path,
        search: queryParams.toString(),
      });
    },
    [sequencePageLink, navigate, search]
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
    [toFilePage, toGenericPage, toSequencePage, toTimeseriesPage]
  );

  const toLandingPage = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const toCharts = (timeseriesId: number, dateRange?: DateRange) => {
    const query = {
      timeserieIds: timeseriesId,
      startTime: dateRange ? dateRange[0].getTime() : undefined,
      endTime: dateRange ? dateRange[1].getTime() : undefined,
    };

    window.open(chartsAppLink(query), '_blank');
  };

  const toCanvas = (containerReference: ContainerReference) => {
    // Fix the 'any'...
    const initializeWithContainerReferences = btoa(
      JSON.stringify([containerReference])
    );

    window.open(
      canvasAppLink({
        initializeWithContainerReferences,
      }),
      '_blank'
    );
  };

  const goBack = useCallback(() => {
    navigate('..');
  }, [navigate]);

  return {
    toLandingPage,
    toSearchPage,
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
