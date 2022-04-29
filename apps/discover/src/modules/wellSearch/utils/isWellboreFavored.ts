import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { FavoriteContentWells } from 'modules/favorite/types';

import { WellboreId, WellId } from '../types';

export const isWellboreFavored = (
  favoriteWellIds: FavoriteContentWells,
  wellId: WellId,
  wellboreId: WellboreId
): boolean => {
  // undefined favorite set or well id not in favorite
  if (
    isUndefined(favoriteWellIds) ||
    !Object.keys(favoriteWellIds).includes(String(wellId))
  )
    return false;

  // wellbore list not empty and wellbore row not in welbore list
  if (
    !isEmpty(favoriteWellIds[wellId]) &&
    !favoriteWellIds[wellId].includes(String(wellboreId))
  )
    return false;

  return true;
};
