import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApiV1 } from 'src/api/annotation/AnnotationApiV1';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';

const BATCH_SIZE = 10;

export const DeleteAnnotationsForDeletedFiles = createAsyncThunk<
  void,
  number[],
  ThunkConfig
>('DeleteAnnotationsForDeletedFiles', async (fileIds, { dispatch }) => {
  const batchFileIdsList: number[][] = fileIds.reduce((acc, _, i) => {
    if (i % BATCH_SIZE === 0) {
      acc.push(fileIds.slice(i, i + BATCH_SIZE));
    }
    return acc;
  }, [] as number[][]);
  const requests = batchFileIdsList.map((batch) => {
    const filterPayload: any = {
      annotatedResourceType: 'file',
      annotatedResourceIds: batch.map((id) => ({ id })),
    };
    const annotationListRequest = {
      filter: filterPayload,
      limit: -1,
    };
    return AnnotationApiV1.list(annotationListRequest); // TODO: use pagination
  });

  if (requests.length) {
    const annotationsPerResponse = await Promise.all(requests);
    const annotations = annotationsPerResponse.reduce((acc, rs) => {
      return acc.concat(rs);
    });
    await dispatch(
      DeleteAnnotations(annotations.map((annotation) => annotation.id))
    );
  }
});
