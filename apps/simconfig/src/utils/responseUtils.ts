import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';

import type {
  RequestFailed,
  RequestSucceeded,
} from '@cognite/simconfig-api-sdk/rtk';

export const isSuccessResponse = (
  response:
    | { data: RequestFailed | RequestSucceeded }
    | { error: FetchBaseQueryError | SerializedError }
): response is { data: RequestSucceeded } =>
  'data' in response && response.data.responseStatus === 'OK';
