import { WellInternal } from 'domain/wells/well/internal/types';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { useDeepMemo } from 'hooks/useDeep';

import { WellboreId } from '../types';
import { getWellsOfWellIds } from '../utils/wells';

import { useWellsCacheQuery } from './useWellsCacheQuery';

type Result = {
  wells: WellInternal[];
  error?: Error | undefined;
};
export const useWellsByIds = (wellIds?: WellInternal['id'][]) => {
  const { data: fetchedWells } = useWellsCacheQuery(wellIds);

  return useDeepMemo(() => {
    // If required wells are empty, return an empty array.
    if (
      !wellIds ||
      isEmpty(wellIds) ||
      !fetchedWells?.wells ||
      fetchedWells.error
    ) {
      return {
        wells: [],
        error: fetchedWells?.error,
      } as Result;
    }
    // Filter cached data by required ids and return.
    return {
      wells: getWellsOfWellIds(fetchedWells.wells, wellIds),
      error: fetchedWells.error,
    } as Result;
  }, [wellIds, fetchedWells]);
};

export const useWellById = (wellId?: WellInternal['id']) => {
  const { wells } = useWellsByIds(wellId ? [wellId] : []);
  return !wellId ? null : head(wells) || null;
};

export const useWellboresOfWellById = (
  wellId?: WellInternal['id'],
  filterWellboresByIds?: WellboreId[]
) => {
  const well = useWellById(wellId);

  return useDeepMemo(() => {
    if (!well) return [];

    if (!filterWellboresByIds) return well.wellbores || [];

    return (
      well.wellbores?.filter((wellbore) =>
        filterWellboresByIds.includes(wellbore.id)
      ) || []
    );
  }, [well, filterWellboresByIds]);
};
