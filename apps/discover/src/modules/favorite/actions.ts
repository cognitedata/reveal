import { ThunkResult } from 'core/types';

import {
  SET_VIEWMODE,
  HIDE_CREATE_MODAL,
  SHOW_CREATE_MODAL,
  ViewModeType,
  FavouriteState,
  SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION,
} from './types';

export function hideCreateFavoriteSetModal(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: HIDE_CREATE_MODAL });
  };
}

export function showCreateFavoriteSetModal(): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: SHOW_CREATE_MODAL });
  };
}

/**
 * This function sets which view mode the favourite page should present the data.
 * @param {ViewMode} VieMode which view mode to set.
 */
export function setViewMode(ViewMode: ViewModeType): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: SET_VIEWMODE, viewMode: ViewMode });
  };
}

export function setItemsToAddAfterFavoriteCreation(
  payload: FavouriteState['itemsToAddAfterFavoriteCreation'] | undefined
): ThunkResult<void> {
  return (dispatch) => {
    dispatch({ type: SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION, payload });
  };
}
