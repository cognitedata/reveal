import { createSlice } from '@reduxjs/toolkit';
import { fetchUserGroups } from 'modules/app/thunks';
import { AppState } from 'modules/app/types';

export const appSlice = createSlice({
  name: 'app',
  initialState: {
    loaded: false,
    groups: {},
  } as AppState,
  reducers: {
    setTenant: (state, action) => {
      state.tenant = action.payload.tenant;
    },
    setCdfEnv: (state, action) => {
      state.cdfEnv = action.payload.cdfEnv;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchUserGroups.rejected, (state) => {
        state.loaded = true;
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        return { ...state, ...action.payload };
      }),
});

export { fetchUserGroups };
export const { setTenant, setCdfEnv } = appSlice.actions;
export const { reducer } = appSlice;
