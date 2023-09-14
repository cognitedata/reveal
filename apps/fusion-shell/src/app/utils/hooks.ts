import { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

import sdk, { getFlow, getUserInformation } from '@cognite/cdf-sdk-singleton';
import { getCluster } from '@cognite/cdf-utilities';
import { useFlag } from '@cognite/react-feature-flags';
import { useSearch } from '@cognite/sdk-react-query-hooks';

import { SearchItem } from '../components/GlobalSearch/ResourcesMenuGroup';
import { AppItem, Token } from '../types';

import { useImportMapApps } from './useImportMapApps';

export const useExperimentalFeatures = () => {
  const { isEnabled: isWorkflowsEnabled } = useFlag('DATA_OPS_workflows', {
    fallback: false,
    forceRerender: true,
  });

  // This is the old DSHub that we should remove
  const { isEnabled: isDSHubEnabled } = useFlag('FUNCTIONS_ds_hub', {
    fallback: false,
    forceRerender: true,
  });

  const { isEnabled: isJupyterNotebooksEnabled } = useFlag('JupyterNotebook', {
    fallback: false,
    forceRerender: true,
  });

  const { isEnabled: isStreamLitEnabled } = useFlag('StreamLitInFusion', {
    fallback: false,
    forceRerender: true,
  });

  const { isEnabled: isIoTHubEnabled } = useFlag('IoT_Hub', {
    fallback: false,
    forceRerender: true,
  });

  const { isEnabled: isDashboardSessionsEnabled } = useFlag(
    'DASHBOARD_SESSIONS_ui',
    {
      fallback: false,
      forceRerender: true,
    }
  );

  const { isEnabled: isDomainsEnabled } = useFlag('DOMAINS_allowlist', {
    fallback: false,
    forceRerender: true,
  });

  const { isEnabled: isVisionMLEnabled } = useFlag('VISION_ML', {
    fallback: false,
    forceRerender: true,
  });

  const { isEnabled: isDQMEnabled } = useFlag('DQM_allowlist', {
    fallback: false,
    forceRerender: true,
  });

  const { isEnabled: isDocumentClassifiersEnabled } = useFlag(
    'DOCUMENT_CLASSIFIERS_allowlist',
    {
      fallback: false,
      forceRerender: true,
    }
  );

  const { isEnabled: isFlowsEnabled } = useFlag('DATA_ONBOARDING_FLOWS', {
    fallback: false,
    forceRerender: true,
  });

  // // Re-enable this if you need to hide Charts behind a feature flag.
  // const { isEnabled: isChartsUIEnabled } = useFlag('CHARTS_UI', {
  //   fallback: false,
  //   forceRerender: true,
  // });

  const { isEnabled: isSimIntUIEnabled } = useFlag('SIMINT_UI', {
    fallback: false,
    forceRerender: true,
  });

  const { isEnabled: isCodingConventionsEnabled } = useFlag(
    'CODING_CONVENTIONS_allowlist',
    {
      fallback: false,
      forceRerender: true,
    }
  );

  const { isEnabled: isIndustryCanvasEnabled } = useFlag(
    'UFV_INDUSTRY_CANVAS',
    {
      fallback: false,
      forceRerender: true,
    }
  );

  const { isEnabled: isInfieldDisabled } = useFlag('DISABLE_INFIELD_MENU', {
    fallback: false,
    forceRerender: true,
  });

  const experimentalFeatures: Record<string, boolean> = {
    jupyter: isDSHubEnabled, // This is the old DSHub that we should remove
    notebook: isJupyterNotebooksEnabled,
    streamlit: isStreamLitEnabled,
    'iot-hub': isIoTHubEnabled,
    workflows: isWorkflowsEnabled,
    'dashboard-sessions': isDashboardSessionsEnabled,
    templates: isDomainsEnabled,
    vision: isVisionMLEnabled,
    dqm: isDQMEnabled,
    'document-search': isDocumentClassifiersEnabled,
    flows: isFlowsEnabled,
    simint: isSimIntUIEnabled,
    'coding-conventions': isCodingConventionsEnabled,
    'industry-canvas': isIndustryCanvasEnabled,
    infield: !isInfieldDisabled,
    // // Re-enable this if you need to hide Charts behind a feature flag.
    // charts: isChartsUIEnabled,
  };
  return experimentalFeatures;
};

export const useFeatureToggledItems = <T extends AppItem>(items: T[]) => {
  const { flow } = getFlow();
  const cluster = getCluster() || '';
  const { data: importMapApps } = useImportMapApps();
  const experimentalFeatures = useExperimentalFeatures();

  return items
    .filter((item) => importMapApps?.includes(item.importMapApp))
    .filter((item) => !item.hideInCluster?.includes(cluster))
    .filter((item) => {
      if (experimentalFeatures[item.internalId] !== undefined) {
        return experimentalFeatures[item.internalId];
      }
      return true;
    })
    .filter((item) => {
      return item.requiredFlow && flow
        ? item.requiredFlow.includes(flow)
        : true;
    });
};

export const useTokenInspect = (options?: UseQueryOptions<Token, unknown>) =>
  useQuery<Token, unknown>(
    ['token'],
    async () => {
      const response = await sdk.get<Token>('/api/v1/token/inspect');
      return response.data;
    },
    options
  );

export const useWindowSize = () => {
  const [size, setSize] = useState([0, 0]);

  const updateSize = () => {
    setSize([window.innerWidth, window.innerHeight]);
  };

  useLayoutEffect(() => {
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
};

export const useDataSetSearch = (query: string, limit: number) => {
  const enabled = !!query && query.length > 0;

  return useQuery(
    // We're not passing the `query` here because we just want to cache this
    // since it is the entirety of the payload and we're doing client side filtering.
    ['search', 'datasets'],
    () => {
      return sdk.datasets.list().autoPagingToArray({ limit: -1 });
    },
    {
      enabled,
      select: (data) => {
        // We need to do toLocaleLowerCase in order to support japanese, the fuzzy search
        // should also be able to work with japanese as well.
        const queryLowercase = query.toLocaleLowerCase();
        // TODO: make this a fuzzy search instead, and we need to make sure we display
        // all the required things data sets include since they aren't just labels, e.g.
        // `dataset.externalId` and below it `dataset.description` and if applicable
        // `dataset.name`, as well as anything else we might use to describe datasets.
        return data
          ?.filter(
            (dataset) =>
              dataset?.description
                ?.toLocaleLowerCase()
                ?.includes(queryLowercase) ||
              dataset?.externalId
                ?.toLocaleLowerCase()
                .includes(queryLowercase) ||
              dataset?.name?.toLocaleLowerCase().includes(queryLowercase)
          )
          .slice(0, limit);
      },
    }
  );
};

export const useSubApp = (): string => {
  const location = useLocation();

  return `/${location.pathname?.split('/')?.[2] ?? ''}`;
};

export const useUserInformation = () => {
  return useQuery(['user-info'], () => getUserInformation());
};

export const useGlobalSearch = () => {
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery] = useDebounce(query, 100);

  // While this looks like it's unnecessary, we actually need it in order for the
  // dropdown to be visible when it has a query, rather than always being triggered
  // with a 'click'. We can't rely just on the search query to display the state.
  const [isSearchDropdownVisible, setIsSearchDropdownVisible] = useState(false);
  useEffect(() => {
    const newVisibility = Boolean(query?.length);
    setIsSearchDropdownVisible(newVisibility);
  }, [query]);

  return {
    query,
    setQuery,
    debouncedQuery,
    isSearchDropdownVisible,
    setIsSearchDropdownVisible,
  };
};

type TDataCatalogSearch = {
  query: string;
  limit: number;
};

export const useDataCatalogSearchResults = ({
  query,
  limit,
}: TDataCatalogSearch) => {
  const enabled = !!query && query.length > 0;
  const datasets = useDataSetSearch(query, limit);

  const assets = useSearch<SearchItem>(
    'assets',
    query,
    {
      limit,
    },
    {
      enabled,
    }
  );

  const events = useSearch<SearchItem>(
    'events',
    query,
    {
      limit,
    },
    {
      enabled,
    }
  );

  const files = useSearch<SearchItem>(
    'files',
    query,
    {
      limit,
    },
    {
      enabled,
    }
  );

  const sequences = useSearch<SearchItem>(
    'sequences',
    query,
    {
      limit,
    },
    {
      enabled,
    }
  );

  const timeseries = useSearch<SearchItem>(
    'timeseries',
    query,
    {
      limit,
    },
    {
      enabled,
    }
  );

  return { datasets, assets, events, files, sequences, timeseries };
};
