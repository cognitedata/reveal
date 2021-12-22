import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from 'store/constants';
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
          requestStatus: RequestStatus.Loading,
        })
      )
      .addCase(fetchGroups.fulfilled, (state, action) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.Success,
          initialized: true,
          groups: action.payload,
        })
      )
      .addCase(fetchGroups.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.Error,
        })
      );
  },
});

export const groupReducer = groupSlice.reducer;
