import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { Dispatch, MiddlewareAPI, PayloadAction } from '@reduxjs/toolkit';

import { appSlice } from 'store/app';

export function reauthenticationMiddleware({ dispatch }: MiddlewareAPI) {
  return (next: Dispatch) =>
    (
      action: PayloadAction<{
        status?: number;
      }>
    ) => {
      if (isRejectedWithValue(action) && action.payload.status === 401) {
        dispatch(appSlice.actions.setIsAuthenticated(false));
      }
      return next(action);
    };
}
