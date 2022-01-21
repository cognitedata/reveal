import { isRejectedWithValue } from '@reduxjs/toolkit';
import type { Dispatch, MiddlewareAPI, PayloadAction } from '@reduxjs/toolkit';

import { toast } from '@cognite/cogs.js';
import type { CogniteApiError } from '@cognite/simconfig-api-sdk/rtk';

export function errorNotificationMiddleware(_api: MiddlewareAPI) {
  return (next: Dispatch) =>
    (
      action: PayloadAction<{
        status?: number;
        data?: { error?: CogniteApiError };
        error?: CogniteApiError;
      }>
    ) => {
      if (isRejectedWithValue(action)) {
        // Don't display notification on 404 errors
        if (
          action.payload.data?.error?.message &&
          action.payload.status !== 404
        ) {
          toast.error(
            `Request failed: ${
              action.payload.error?.message ?? 'Unknown error'
            } (${action.error.message ?? '-'})`
          );
        }
      }
      return next(action);
    };
}
