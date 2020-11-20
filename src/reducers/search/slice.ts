import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ValueOf } from 'typings/utils';

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    isVisible: false,
    activeChartId: '',
  },
  reducers: {
    showSearch: (state) => {
      state.isVisible = true;
    },
    hideSearch: (state) => {
      state.isVisible = false;
    },
    setActiveChartId: (state, action: PayloadAction<string>) => {
      state.activeChartId = action.payload;
    },
  },
});

export default searchSlice;
export type SearchAction = ReturnType<ValueOf<typeof searchSlice.actions>>;
export type SearchState = ReturnType<typeof searchSlice.reducer>;
