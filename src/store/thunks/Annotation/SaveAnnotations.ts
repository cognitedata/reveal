import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { Annotation } from 'src/api/vision/detectionModels/types';
import { validateAnnotation } from 'src/api/annotation/utils';

export const SaveAnnotations = createAsyncThunk<
  Annotation[],
  UnsavedAnnotation[],
  ThunkConfig
>('SaveAnnotations', async (annotations) => {
  const filteredAnnotations = annotations.filter((annotation) =>
    validateAnnotation(annotation)
  ); // validate annotations

  const data = { items: filteredAnnotations };

  const response = await AnnotationApi.create(data);
  return response.data.items;
});
