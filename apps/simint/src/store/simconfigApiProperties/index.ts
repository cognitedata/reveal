import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { SimconfigApiPropertiesState } from '@cognite/simconfig-api-sdk/rtk';

import { initialState } from './constants';

export const simconfigApiPropertiesSlice = createSlice({
  name: 'simconfigApiProperties',
  initialState,
  reducers: {
    setProperties: (
      state,
      action: PayloadAction<Partial<SimconfigApiPropertiesState>>
    ) => ({
      ...state,
      ...action.payload,
    }),
  },
});

export const simconfigApiPropertiesReducer =
  simconfigApiPropertiesSlice.reducer;
