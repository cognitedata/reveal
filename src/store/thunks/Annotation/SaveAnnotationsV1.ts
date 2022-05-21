import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { UnsavedAnnotation, CDFAnnotationV1 } from 'src/api/annotation/types';
import { validateAnnotation } from 'src/api/annotation/utils';

export const SaveAnnotationsV1 = createAsyncThunk<
  CDFAnnotationV1[],
  UnsavedAnnotation[],
  ThunkConfig
>('SaveAnnotationsV1', async (annotations) => {
  const filteredAnnotations = annotations.filter((annotation) =>
    validateAnnotation(annotation)
  ); // validate annotations

  const data = { items: filteredAnnotations };

  const response = await AnnotationApi.create(data);
  return response.data.items;
});
