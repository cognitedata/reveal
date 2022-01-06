import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { useDeepMemo } from 'hooks/useDeep';

import { WellboreId, WellId } from '../types';
import { getWellsOfWellIds } from '../utils/wells';

import { useWellsQuery } from './useWellsQuery';

export const useWellsByIds = (wellIds?: WellId) => {
  const { data: fetchedWells } = useWellsQuery(wellIds);

  return useDeepMemo(() => {
    // If required wells are empty, return an empty array.
    if (!wellIds || isEmpty(wellIds) || !fetchedWells) return [];

    // Filter cached data by required ids and return.
    return getWellsOfWellIds(fetchedWells, wellIds);
  }, [wellIds, fetchedWells]);
};

export const useWellById = (wellId?: WellId) => {
  const wells = useWellsByIds(wellId ? [wellId] : []);
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
  }, []);
};
