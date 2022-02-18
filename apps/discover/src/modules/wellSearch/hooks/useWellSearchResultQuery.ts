import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import { getListWells } from 'services/well/well/service';

import { Metrics } from '@cognite/metrics';

import { LOG_WELL_SEARCH, LOG_WELL_SEARCH_NAMESPACE } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useDeepEffect } from 'hooks/useDeep';
import { TimeLogStages } from 'hooks/useTimeLog';

import {
  getAllByFilters,
  getByFilters,
  getWellsWithWellbores,
} from '../service';
import { Well } from '../types';
import { handleWellSearchError } from '../utils/wellSearch';

import { useAddToWellsCache } from './useAddToWellsCache';
import { useCommonWellFilter } from './useCommonWellFilter';
import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';
import { useWellConfig } from './useWellConfig';

const wellSearchMetric = Metrics.create(LOG_WELL_SEARCH);

export const useAllWellSearchResultQuery = (): UseQueryResult<Well[]> => {
  const { data: wellConfig } = useWellConfig();
  const wellFilter = useCommonWellFilter();
  const queryClient = useQueryClient();

  useDeepEffect(() => {
    queryClient.invalidateQueries(WELL_QUERY_KEY.ALL);
  }, [wellFilter]);

  return useQuery(
    WELL_QUERY_KEY.ALL,
    ({ signal }) => {
      return getAllByFilters(wellFilter, { signal });
    },
    {
      enabled: wellConfig?.disabled !== true,
    }
  );
};

export type WellSearchResult = {
  wells: Well[];
  totalWells?: number;
  totalWellbores?: number;
};
export const useWellSearchResultQuery =
  (): UseQueryResult<WellSearchResult> => {
    const wellFilter = useCommonWellFilter();
    const { data: wellConfig } = useWellConfig();
    const enabledWellSdkV3 = useEnabledWellSdkV3();
    const addToWellsCache = useAddToWellsCache();

    return useQuery(
      WELL_QUERY_KEY.SEARCH(wellFilter),
      () => {
        const timer = wellSearchMetric.start(LOG_WELL_SEARCH_NAMESPACE, {
          stage: TimeLogStages.Network,
        });

        if (enabledWellSdkV3) {
          return getListWells(wellFilter)
            .then(({ wells, ...rest }) => {
              addToWellsCache(wells);
              return { wells, ...rest };
            })
            .catch(handleWellSearchError)
            .finally(() => timer.stop());
        }

        // v2
        return getByFilters(wellFilter)
          .then((wells) => {
            return getWellsWithWellbores(wells);
          })
          .then((wells) => {
            addToWellsCache(wells);
            return { wells, totalWells: wells.length };
          })
          .catch(handleWellSearchError)
          .finally(() => timer.stop());
      },
      {
        enabled: wellConfig?.disabled !== true,
      }
    );
  };
