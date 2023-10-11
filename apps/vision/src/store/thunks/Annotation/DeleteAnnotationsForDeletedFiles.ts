import { createAsyncThunk } from '@reduxjs/toolkit';

import sdk from '@cognite/cdf-sdk-singleton';
import { AnnotationFilterRequest, InternalId } from '@cognite/sdk';

import { ANNOTATED_RESOURCE_TYPE } from '../../../constants/annotationMetadata';
import { ThunkConfig } from '../../rootReducer';

import { DeleteAnnotations } from './DeleteAnnotations';

const BATCH_SIZE = 10;

/**
 * ## Example
 * ```typescript
 * dispatch(
 *   DeleteAnnotationsForDeletedFiles([
 *     {
 *       id: 1,
 *     }
 *   ])
 * );
 * ```
 */
export const DeleteAnnotationsForDeletedFiles = createAsyncThunk<
  void,
  InternalId[],
  ThunkConfig
>('DeleteAnnotationsForDeletedFiles', async (fileIds, { dispatch }) => {
  const batchFileIdsList: InternalId[][] = fileIds.reduce((acc, _, i) => {
    if (i % BATCH_SIZE === 0) {
      acc.push(fileIds.slice(i, i + BATCH_SIZE));
    }
    return acc;
  }, [] as InternalId[][]);

  const promises = batchFileIdsList.map((batch) => {
    const filter: AnnotationFilterRequest = {
      filter: {
        annotatedResourceType: ANNOTATED_RESOURCE_TYPE,
        annotatedResourceIds: batch,
      },
      limit: 1000,
    };

    const annotationPromise = sdk.annotations
      .list(filter)
      .autoPagingToArray({ limit: Infinity });
    return annotationPromise;
  });

  if (promises.length) {
    const annotationsPerBatch = await Promise.all(promises);
    const annotationIds: InternalId[] = annotationsPerBatch
      .map((batchAnnotations) => batchAnnotations.map((a) => ({ id: a.id })))
      .flat();
    // TODO: handle API deletion limits
    await dispatch(DeleteAnnotations(annotationIds));
  }
});
