import { createSlice } from '@reduxjs/toolkit';
import { ValueOf } from 'typings/utils';

const searchSlice = createSlice({
  name: 'collections',
  initialState: {
    isVisible: false,
  },
  reducers: {
    showSearch: (state) => {
      state.isVisible = true;
    },
    hideSearch: (state) => {
      state.isVisible = false;
    },
  },
});

export default searchSlice;
export type SearchAction = ReturnType<ValueOf<typeof searchSlice.actions>>;
export type SearchState = ReturnType<typeof searchSlice.reducer>;
