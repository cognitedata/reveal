import { normalizeWell } from 'domain/wells/well/internal/transformers/normalizeWell';
import { WellInternal } from 'domain/wells/well/internal/types';
import { getWellsByIds } from 'domain/wells/well/service/network/getWellsById';

import React from 'react';
import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import concat from 'lodash/concat';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';
import { handleServiceError, PossibleError } from 'utils/errors';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { ERROR_LOADING_WELLS_ERROR } from '../constants';
import { WellId, WellResult } from '../types';

import { useWellConfig } from './useWellConfig';

/**
 * This hook returns the query result of the cached wells.
 * The cache is updated as per the well search results and requested wells.
 *
 * If you got [well1, well2] for `searchQuery1`, the cache is having [well1, well2].
 * If you got [well2, well3] for `searchQuery3`, then [well3] is added to the cache and updated.
 *
 * If you requested [well1, well2, well3, well4], then only [well4] is fetched and cache is updated.
 */
export const useWellsCacheQuery = (
  requiredWellIds: WellId[] = []
): UseQueryResult<WellResult> => {
  const queryClient = useQueryClient();
  const { data: wellConfig } = useWellConfig();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const cachedWells =
    queryClient.getQueryData<WellInternal[]>(WELL_QUERY_KEY.WELLS_CACHE) || [];

  const cachedWellIds = useDeepMemo(
    () => cachedWells.map((well) => String(well.id)),
    [cachedWells]
  );

  return useQuery<WellResult>(
    [WELL_QUERY_KEY.WELLS_ONE, requiredWellIds, userPreferredUnit],
    async () => {
      const uncachedWellIds = difference(requiredWellIds, cachedWellIds);
      // console.log('uncachedWellIds', uncachedWellIds);

      if (isEmpty(uncachedWellIds))
        return {
          wells: cachedWells,
        };

      // console.log('Fetching wells:', uncachedWellIds);
      let uncachedWells: WellInternal[];

      try {
        uncachedWells = await getWellsByIds(uncachedWellIds).then((wells) =>
          wells.map((rawWell) => normalizeWell(rawWell, userPreferredUnit))
        );
      } catch (error) {
        // console.log('Error loading wells:', error);
        return handleServiceError<WellResult>(
          error as PossibleError,
          {
            wells: [],
            error: {
              message: 'Error fetching wells',
            },
          },
          ERROR_LOADING_WELLS_ERROR
        );
      }

      // console.log('New uncached wells:', uncachedWells);
      const updatedCache = concat(cachedWells, uncachedWells);
      // console.log('Updated cache:', updatedCache);

      queryClient.setQueryData(WELL_QUERY_KEY.WELLS_CACHE, updatedCache);
      return {
        wells: updatedCache,
      };
    },
    {
      enabled: wellConfig?.disabled !== true,
      select: React.useCallback(
        (result: WellResult) => {
          return {
            wells: result.wells.filter((well: WellInternal) =>
              requiredWellIds.map(String).includes(String(well.id))
            ),
            error: result.error,
          };
        },
        [requiredWellIds]
      ),
    }
  );
};
