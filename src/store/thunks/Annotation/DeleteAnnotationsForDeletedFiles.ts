import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
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
      limit: 1000,
    };
    return AnnotationApi.list(annotationListRequest); // TODO: use pagination
  });

  if (requests.length) {
    const responses = await Promise.all(requests);
    const annotationsPerResponse = responses.map(
      (res) => res?.data?.items || []
    );
    const annotations = annotationsPerResponse.reduce((acc, rs) => {
      return acc.concat(rs);
    });
    await dispatch(
      DeleteAnnotations(annotations.map((annotation) => annotation.id))
    );
  }
});
