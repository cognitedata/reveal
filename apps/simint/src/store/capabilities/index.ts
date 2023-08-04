import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { initialState } from './constants';
import type { CapabilitiesState } from './types';

export const capabilitiesSlice = createSlice({
  name: 'capabilities',
  initialState,
  reducers: {
    setCapabilities: (
      state,
      action: PayloadAction<Partial<CapabilitiesState>>
    ) => ({
      ...state,
      ...action.payload,
    }),
  },
});

export const capabilitiesReducer = capabilitiesSlice.reducer;
