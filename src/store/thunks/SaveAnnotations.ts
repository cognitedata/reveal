import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { Annotation } from 'src/api/types';

export const SaveAnnotations = createAsyncThunk<
  Annotation[],
  UnsavedAnnotation[],
  ThunkConfig
>('SaveAnnotations', async (annotations) => {
  const data = { items: annotations };

  const response = await AnnotationApi.create(data);
  return response.data.items;
});
