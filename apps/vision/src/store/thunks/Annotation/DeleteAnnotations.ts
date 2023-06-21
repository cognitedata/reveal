import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from '@vision/store/rootReducer';

import sdk from '@cognite/cdf-sdk-singleton';
import { InternalId } from '@cognite/sdk';

/**
 * ## Example
 * ```typescript
 * dispatch(
 *   DeleteAnnotations([
 *     {
 *       id: 1,
 *     }
 *   ])
 * );
 * ```
 */

export const DeleteAnnotations = createAsyncThunk<
  void,
  InternalId[],
  ThunkConfig
>('DeleteAnnotations', async (annotationIds: InternalId[]) => {
  if (annotationIds && annotationIds.length) {
    await sdk.annotations.delete(annotationIds);
  }
});
