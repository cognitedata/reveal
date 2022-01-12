import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FavoriteState, ViewModeType } from 'modules/favorite/types';

export const initialState: FavoriteState = {
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
    setItemsToAddOnFavoriteCreation(
      state,
      action: PayloadAction<FavoriteState['itemsToAddOnFavoriteCreation']>
    ) {
      state.itemsToAddOnFavoriteCreation = action.payload;
    },
  },
});

export const {
  showCreateFavoriteModal,
  hideCreateFavoriteModal,
  setFavoritesViewMode,
  setItemsToAddOnFavoriteCreation,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
