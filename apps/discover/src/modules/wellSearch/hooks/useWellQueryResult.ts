import compact from 'lodash/compact';

import { WellId } from '../types';

import { useWellSearchResultQuery } from './useWellSearchResultQuery';

export const useWellQueryResultWells = () => {
  const { data: wells } = useWellSearchResultQuery();
  return wells || [];
};

export const useWellQueryResultWellbores = (wellIds: WellId[]) => {
  const { data: wells } = useWellSearchResultQuery();

  if (!wells) return [];

  return compact(
    wells
      .filter((well) => wellIds.includes(well.id))
      .flatMap((well) => well.wellbores)
  );
};
