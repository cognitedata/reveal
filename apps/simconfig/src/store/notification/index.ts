import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { partialUpdate } from 'store/utils';
import { fetchCalculationFile, updateCalculationFile } from 'store/file/thunks';

import { NotificationState, NotificationType } from './types';
import { initialState } from './constants';

export const notificationSlice = createSlice({
  name: 'notification',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    clearNotification: (state) =>
      partialUpdate(state, {
        title: undefined,
        message: undefined,
        type: NotificationType.default,
      }),
    setNotification: (
      state,
      action: PayloadAction<NotificationState | undefined>
    ) =>
      partialUpdate(state, {
        title: action.payload?.title,
        message: action.payload?.message,
        type: action.payload?.type || NotificationType.default,
      }),
  },
  extraReducers: (builder) => {
    builder.addCase(updateCalculationFile.rejected, (state, action) =>
      partialUpdate(state, {
        title: action.error.name,
        message: action.error.message,
        type: NotificationType.error,
      })
    );
    builder.addCase(fetchCalculationFile.rejected, (state, action) =>
      partialUpdate(state, {
        title: action.error.name,
        message: action.error.message,
        type: NotificationType.error,
      })
    );
  },
});

export const { clearNotification, setNotification } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
