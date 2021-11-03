import { useMemo } from 'react';

import uniq from 'lodash/uniq';

import { useFavoritesGetAllQuery } from 'modules/api/favorites/useFavoritesQuery';

import { WellId } from '../types';

export const useFavoriteWellIds = (): WellId[] => {
  const { data: favoriteSets } = useFavoritesGetAllQuery();

  return useMemo(() => {
    if (!favoriteSets || 'error' in favoriteSets) {
      return [];
    }

    return uniq(
      favoriteSets.flatMap((favoriteSet) =>
        Object.keys(favoriteSet.content.wells)
      )
    );
  }, [favoriteSets]);
};
