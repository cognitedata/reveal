import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { Annotation } from 'src/api/types';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';

export const RetrieveAnnotations = createAsyncThunk<
  Annotation[],
  { fileIds: number[] },
  ThunkConfig
>('RetrieveAnnotations', async (payload) => {
  const filterPayload: any = {
    annotatedResourceType: 'file',
    annotatedResourceIds: payload.fileIds.map((id) => ({
      id,
    })),
  };

  const annotationListRequest = {
    filter: filterPayload,
  };
  const response = await AnnotationApi.list(annotationListRequest);

  return response.data.items;
});
