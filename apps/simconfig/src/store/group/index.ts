import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from 'store/types';
import { partialUpdate } from 'store/utils';

import { initialState } from './constants';
import { fetchGroups } from './thunks';

export const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.LOADING,
        })
      )
      .addCase(fetchGroups.fulfilled, (state, action) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.SUCCESS,
          initialized: true,
          groups: action.payload,
        })
      )
      .addCase(fetchGroups.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.ERROR,
        })
      );
  },
});

export const groupReducer = groupSlice.reducer;
