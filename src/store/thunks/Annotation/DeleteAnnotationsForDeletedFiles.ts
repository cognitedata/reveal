import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { InternalId } from '@cognite/sdk';
import { useCognitePlaygroundClient } from 'src/hooks/useCognitePlaygroundClient';
import { AnnotationFilterRequest } from '@cognite/sdk-playground';
import { ANNOTATED_RESOURCE_TYPE } from 'src/constants/annotationMetadata';

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
  const sdk = useCognitePlaygroundClient();

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
      limit: -1,
    };

    const annotationPromise = sdk.annotations.list(filter);
    return annotationPromise;
  });

  if (promises.length) {
    const annotationsPerBatch = await Promise.all(promises);
    const annotationIds: InternalId[] = annotationsPerBatch
      .map((batchAnnotations) =>
        batchAnnotations.items.map((a) => ({ id: a.id }))
      )
      .flat();
    // TODO: handle API deletion limits
    await dispatch(DeleteAnnotations(annotationIds));
  }
});
