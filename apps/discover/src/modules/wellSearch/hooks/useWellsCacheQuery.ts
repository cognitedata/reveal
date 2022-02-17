import React from 'react';
import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import concat from 'lodash/concat';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';

// import { reportException } from '@cognite/react-errors';

import { showErrorMessage } from 'components/toast';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useDeepMemo } from 'hooks/useDeep';

import { ERROR_LOADING_WELLS_ERROR } from '../constants';
import {
  getWellsByWellIdsv3,
  getWellsByWellIds,
  getWellsWithWellbores,
} from '../service';
import { Well, WellId } from '../types';

import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';
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
): UseQueryResult<Well[]> => {
  const queryClient = useQueryClient();
  const { data: wellConfig } = useWellConfig();
  const enabledWellSdkV3 = useEnabledWellSdkV3();

  const cachedWells =
    queryClient.getQueryData<Well[]>(WELL_QUERY_KEY.WELLS_CACHE) || [];

  const cachedWellIds = useDeepMemo(
    () => cachedWells.map((well) => String(well.id)),
    [cachedWells]
  );

  // console.log('Existing wells:', cachedWellIds);

  return useQuery<Well[]>(
    [WELL_QUERY_KEY.WELLS_ONE, requiredWellIds],
    async () => {
      const uncachedWellIds = difference(requiredWellIds, cachedWellIds);
      // console.log('uncachedWellIds', uncachedWellIds);

      if (isEmpty(uncachedWellIds)) return cachedWells;

      // console.log('Fetching wells:', uncachedWellIds);
      let uncachedWells: Well[];

      try {
        if (enabledWellSdkV3) {
          uncachedWells = await getWellsByWellIdsv3(uncachedWellIds);
        } else {
          uncachedWells = await getWellsByWellIds(uncachedWellIds);
          uncachedWells = await getWellsWithWellbores(uncachedWells);
        }
      } catch {
        showErrorMessage(ERROR_LOADING_WELLS_ERROR);
        // console.log('Error loading wells:', error);
        // to add:
        // reportException(error);
        return [] as Well[];
      }

      // console.log('New uncached wells:', uncachedWells);
      const updatedCache = concat(cachedWells, uncachedWells);
      // console.log('Updated cache:', updatedCache);

      queryClient.setQueryData(WELL_QUERY_KEY.WELLS_CACHE, updatedCache);

      return updatedCache;
    },
    {
      enabled: wellConfig?.disabled !== true && enabledWellSdkV3 !== undefined,
      select: React.useCallback(
        (wells) => {
          return wells.filter((well: Well) =>
            // @sdk-wells-v3
            requiredWellIds.map(String).includes(String(well.id))
          );
        },
        [requiredWellIds]
      ),
    }
  );
};
