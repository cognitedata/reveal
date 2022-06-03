import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { InternalId } from '@cognite/sdk';
import { cognitePlaygroundClient } from 'src/api/annotation/CognitePlaygroundClient';

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
  InternalId[],
  InternalId[],
  ThunkConfig
>('DeleteAnnotations', async (annotationIds: InternalId[]) => {
  if (annotationIds && annotationIds.length) {
    await cognitePlaygroundClient.annotations.delete(annotationIds);
    return annotationIds;
  }
  return []; // TODO: should this really return input ids?
});
