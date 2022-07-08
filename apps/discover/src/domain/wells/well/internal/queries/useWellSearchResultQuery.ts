import { useWellFilters } from 'domain/wells/well/internal/filters/useWellFilters';
import { WellInternal } from 'domain/wells/well/internal/types';

import { useQuery, UseQueryResult } from 'react-query';

import { Metrics } from '@cognite/metrics';

import { LOG_WELL_SEARCH, LOG_WELL_SEARCH_NAMESPACE } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { TimeLogStages } from 'hooks/useTimeLog';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useSearchPhrase } from 'modules/sidebar/selectors';
import { useAddToWellsCache } from 'modules/wellSearch/hooks/useAddToWellsCache';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { searchWells } from '../../service/network/searchWells';
import { handleWellSearchServiceError } from '../../service/utils/handleWellSearchServiceError';
import { normalizeWell } from '../transformers/normalizeWell';

const wellSearchMetric = Metrics.create(LOG_WELL_SEARCH);

export type WellSearchResult = {
  wells: WellInternal[];
  totalWells?: number;
  totalWellbores?: number;
};
export const useWellSearchResultQuery =
  (): UseQueryResult<WellSearchResult> => {
    const wellFilter = useWellFilters();
    const { data: wellConfig } = useWellConfig();
    const addToWellsCache = useAddToWellsCache();
    const searchPhrase = useSearchPhrase();
    const { data: userPreferredUnit } = useUserPreferencesMeasurement();

    return useQuery(
      [WELL_QUERY_KEY.SEARCH([wellFilter, searchPhrase]), userPreferredUnit],
      () => {
        const timer = wellSearchMetric.start(LOG_WELL_SEARCH_NAMESPACE, {
          stage: TimeLogStages.Network,
        });

        return searchWells(wellFilter, searchPhrase)
          .then(({ wells, ...rest }) => {
            const normalizedWells = wells.map((rawWell) =>
              normalizeWell(rawWell, userPreferredUnit)
            );
            addToWellsCache(normalizedWells);
            return { wells: normalizedWells, ...rest };
          })
          .catch(handleWellSearchServiceError)
          .finally(() => timer.stop());
      },
      {
        enabled: wellConfig?.disabled !== true,
      }
    );
  };
