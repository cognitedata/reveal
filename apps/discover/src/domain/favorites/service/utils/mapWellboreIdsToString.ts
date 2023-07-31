import { FavoriteContentWells } from 'modules/favorite/types';

export const mapWellboreIdsToString = (
  wells?: FavoriteContentWells
): FavoriteContentWells | undefined => {
  if (!wells) {
    return undefined;
  }

  return Object.keys(wells).reduce((current, wellId) => {
    return {
      ...current,
      [wellId]: wells[wellId].map(String),
    };
  }, {});
};
