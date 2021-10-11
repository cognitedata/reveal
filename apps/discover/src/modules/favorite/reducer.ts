import { ViewMode } from 'modules/favorite/constants';
import {
  FavouriteAction,
  FavouriteState,
  HIDE_CREATE_MODAL,
  SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION,
  SET_VIEWMODE,
  SHOW_CREATE_MODAL,
} from 'modules/favorite/types';

export const initialState = {
  selectedItems: [],
  isCreateModalVisible: false,
  viewMode: ViewMode.Card,
};

export function favourite(
  state: FavouriteState = initialState,
  action: FavouriteAction
) {
  switch (action.type) {
    case SHOW_CREATE_MODAL: {
      return {
        ...state,
        isCreateModalVisible: true,
      };
    }

    case HIDE_CREATE_MODAL: {
      return {
        ...state,
        isCreateModalVisible: false,
      };
    }

    case SET_VIEWMODE: {
      return {
        ...state,
        viewMode: action.viewMode,
      };
    }

    case SET_ITEMS_TO_ADD_AFTER_FAVORITE_CREATION: {
      return {
        ...state,
        itemsToAddAfterFavoriteCreation: action.payload,
      };
    }

    default:
      return state;
  }
}
