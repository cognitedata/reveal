import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { partialUpdate } from 'store/utils';

import { initialState } from './constants';
import type { NotificationState } from './types';
import { NotificationType } from './types';

export const notificationSlice = createSlice({
  name: 'notification',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    clearNotification: (state) =>
      partialUpdate(state, {
        title: undefined,
        message: undefined,
        type: NotificationType.Default,
      }),
    setNotification: (
      state,
      action: PayloadAction<NotificationState | undefined>
    ) =>
      partialUpdate(state, {
        title: action.payload?.title,
        message: action.payload?.message,
        type: action.payload?.type ?? NotificationType.Default,
      }),
  },
});

export const { clearNotification, setNotification } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
