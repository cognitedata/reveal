import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { useDeepMemo } from 'hooks/useDeep';

import { WellboreId, WellId } from '../types';
import { getWellsOfWellIds } from '../utils/wells';

import { useWellsCacheQuery } from './useWellsCacheQuery';

export const useWellsByIds = (wellIds?: WellId) => {
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
      };
    }
    // Filter cached data by required ids and return.
    return {
      wells: getWellsOfWellIds(fetchedWells.wells, wellIds),
      error: fetchedWells.error,
    };
  }, [wellIds, fetchedWells]);
};

export const useWellById = (wellId?: WellId) => {
  const { wells } = useWellsByIds(wellId ? [wellId] : []);
  return !wellId ? null : head(wells) || null;
};

export const useWellboresOfWellById = (
  wellId?: WellId,
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
