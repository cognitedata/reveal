import { useMemo } from 'react';

import { useFavoritesGetAllQuery } from 'services/favorites/useFavoritesQuery';

import { FavoriteContentWells } from 'modules/favorite/types';

export const useFavoriteWellIds = (): FavoriteContentWells => {
  const { data: favoriteSets } = useFavoritesGetAllQuery();

  return useMemo(() => {
    if (!favoriteSets || 'error' in favoriteSets) {
      return {};
    }
    const addedWellsAndWellbores: FavoriteContentWells = {};

    favoriteSets.forEach((favoriteSet) => {
      Object.keys(favoriteSet.content.wells).forEach((wellId) => {
        addedWellsAndWellbores[wellId] = addedWellsAndWellbores[wellId]
          ? addedWellsAndWellbores[wellId].concat(
              favoriteSet.content.wells[wellId]
            )
          : favoriteSet.content.wells[wellId];
      });
    });

    return addedWellsAndWellbores;
  }, [favoriteSets]);
};
