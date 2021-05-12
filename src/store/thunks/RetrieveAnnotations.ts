import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { Annotation } from 'src/api/types';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';

export const RetrieveAnnotations = createAsyncThunk<
  Annotation[],
  { fileId: number; assetIds: number[] | undefined },
  ThunkConfig
>('RetrieveAnnotations', async (payload) => {
  let filterPayload: any = {
    annotatedResourceType: 'file',
    annotatedResourceIds: [{ id: payload.fileId }],
  };
  if (payload.assetIds && payload.assetIds.length) {
    filterPayload = {
      ...filterPayload,
      linkedResourceType: 'asset',
      linkedResourceIds: payload.assetIds.map((id) => ({ id })),
    };
  }
  const annotationListRequest = {
    filter: filterPayload,
  };
  const response = await AnnotationApi.list(annotationListRequest);

  return response.data.items;
});
