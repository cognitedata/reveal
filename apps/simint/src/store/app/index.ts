import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { initialState } from './constants';

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isAuthenticated: action.payload,
    }),
    setIsInitialized: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isInitialized: action.payload,
    }),
  },
});

export const appReducer = appSlice.reducer;
