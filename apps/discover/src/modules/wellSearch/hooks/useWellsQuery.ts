import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query';

import concat from 'lodash/concat';
import difference from 'lodash/difference';
import isEmpty from 'lodash/isEmpty';

import { showErrorMessage } from 'components/toast';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { ERROR_LOADING_WELLS_ERROR } from '../constants';
import { getWellsByWellIds, getWellsWithWellbores } from '../service';
import { Well, WellId } from '../types';

import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';
import {
  useWellQueryResultWellIds,
  useWellQueryResultWells,
} from './useWellQueryResultSelectors';

/**
 * This hook returns the query result of the cached wells.
 * The cache is updated as per the well search results and requested wells.
 *
 * If you got [well1, well2] for `searchQuery1`, the cache is automatically updated with [well1, well2].
 * If you got [well2, well3] for `searchQuery3`, then [well3] is added to the cache and updated.
 *
 * If you requested [well1, well2, well3, well4], then only [well4] is fetched and cache is updated.
 */
export const useWellsQuery = (
  requiredWellIds: WellId[] = []
): UseQueryResult<Well[]> => {
  const queryClient = useQueryClient();
  const searchedWells = useWellQueryResultWells();
  const searchedWellIds = useWellQueryResultWellIds();
  const enabledWellSdkV3 = useEnabledWellSdkV3();

  // Set the initial data as the well search result wells.
  const queryResult = useQuery<Well[]>(
    WELL_QUERY_KEY.WELLS_CACHE,
    () => searchedWells
  );

  const alreadyFetchedWells = useDeepMemo(
    () => queryResult.data || [],
    [queryResult.data]
  );

  const alreadyFetchedWellIds = useDeepMemo(
    () => alreadyFetchedWells.map((well) => String(well.id)),
    [alreadyFetchedWells]
  );

  const { mutate: mutatePatchFetchedWells } = useMutation(getWellsByWellIds, {
    onSuccess: async (newlyFetchedWells) => {
      const wellsWithWellbores = enabledWellSdkV3
        ? newlyFetchedWells
        : await getWellsWithWellbores(newlyFetchedWells);

      queryClient.setQueryData(
        WELL_QUERY_KEY.WELLS_CACHE,
        concat(alreadyFetchedWells, wellsWithWellbores)
      );
    },
    onError: () => showErrorMessage(ERROR_LOADING_WELLS_ERROR),
  });

  // Update the cache if new wells are searched or requested additionally.
  useDeepEffect(() => {
    const possibleNewWellIds = concat(searchedWellIds, requiredWellIds);
    const prestineWellIds = difference(
      possibleNewWellIds,
      alreadyFetchedWellIds
    );
    if (!isEmpty(prestineWellIds)) mutatePatchFetchedWells(prestineWellIds);
  }, [searchedWellIds, requiredWellIds]);

  return queryResult;
};
