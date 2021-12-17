import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FavouriteState, ViewModeType } from 'modules/favorite/types';

export const initialState: FavouriteState = {
  isCreateModalVisible: false,
  viewMode: ViewModeType.Card,
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    showCreateFavoriteModal(state) {
      state.isCreateModalVisible = true;
    },
    hideCreateFavoriteModal(state) {
      state.isCreateModalVisible = false;
    },
    setFavoritesViewMode(state, action: PayloadAction<ViewModeType>) {
      state.viewMode = action.payload;
    },
    setItemsToAddAfterFavoriteIsCreated(
      state,
      action: PayloadAction<FavouriteState['itemsToAddAfterFavoriteCreation']>
    ) {
      state.itemsToAddAfterFavoriteCreation = action.payload;
    },
  },
});

export const {
  showCreateFavoriteModal,
  hideCreateFavoriteModal,
  setFavoritesViewMode,
  setItemsToAddAfterFavoriteIsCreated,
} = favoritesSlice.actions;
export default favoritesSlice.reducer;
