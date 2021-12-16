import { useQuery, UseQueryResult } from 'react-query';

import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import set from 'lodash/set';

import { Metrics } from '@cognite/metrics';

import { LOG_WELL_SEARCH, LOG_WELL_SEARCH_NAMESPACE } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { TimeLogStages } from 'hooks/useTimeLog';

import { getByFilters, getGroupedWellboresByWellIds } from '../service';
import { Well } from '../types';
import { handleWellSearchError } from '../utils/wellSearch';

import { useCommonWellFilter } from './useCommonWellFilter';
import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';
import { useWellConfig } from './useWellConfig';

const wellSearchMetric = Metrics.create(LOG_WELL_SEARCH);

export const useWellSearchResultQuery = (): UseQueryResult<Well[]> => {
  const wellFilter = useCommonWellFilter();
  const { data: wellConfig } = useWellConfig();
  const enabledWellSdkV3 = useEnabledWellSdkV3();

  return useQuery(
    [WELL_QUERY_KEY.SEARCH, wellFilter],
    () => {
      const timer = wellSearchMetric.start(LOG_WELL_SEARCH_NAMESPACE, {
        stage: TimeLogStages.Network,
      });

      return getByFilters(wellFilter)
        .then(async (wells) => {
          if (enabledWellSdkV3) return wells;

          const wellIds = map(wells, 'id');
          const groupedWells = groupBy(wells, 'id');
          const groupedWellbores = await getGroupedWellboresByWellIds(wellIds);

          Object.keys(groupedWells).forEach((wellId) => {
            set(groupedWells, wellId, {
              ...get(groupedWells, wellId)[0],
              wellbores: get(groupedWellbores, wellId, []),
            });
          });

          return Object.values(groupedWells);
        })
        .catch(handleWellSearchError)
        .finally(() => timer.stop());
    },
    {
      enabled: !wellConfig?.disabled,
    }
  );
};
