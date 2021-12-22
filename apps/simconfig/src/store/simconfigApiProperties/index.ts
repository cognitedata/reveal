import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { initialState } from './constants';

export const simconfigApiPropertiesSlice = createSlice({
  name: 'simconfigApiProperties',
  initialState,
  reducers: {
    setBaseUrl: (state, action: PayloadAction<string | undefined>) => ({
      ...state,
      baseUrl: action.payload,
    }),
    setAuthToken: (state, action: PayloadAction<string | undefined>) => ({
      ...state,
      authToken: action.payload,
    }),
    setProject: (state, { payload: project }: PayloadAction<string>) => ({
      ...state,
      project,
    }),
  },
});

export const simconfigApiPropertiesReducer =
  simconfigApiPropertiesSlice.reducer;
