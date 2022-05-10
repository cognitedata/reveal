import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApiV1 } from 'src/api/annotation/AnnotationApiV1';
import { UnsavedAnnotation, CDFAnnotationV1 } from 'src/api/annotation/types';
import { validateAnnotationV1 } from 'src/api/annotation/utils';

export const SaveAnnotations = createAsyncThunk<
  CDFAnnotationV1[],
  UnsavedAnnotation[],
  ThunkConfig
>('SaveAnnotations', async (annotations) => {
  const filteredAnnotations = annotations.filter((annotation) =>
    validateAnnotationV1(annotation)
  ); // validate annotations

  const data = { items: filteredAnnotations };

  const response = await AnnotationApiV1.create(data);
  return response.data.items;
});
