import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import {
  getFieldOrSetNull,
  validateAnnotation,
} from 'src/api/annotation/utils';
import {
  AnnotationUtilsV1,
  VisionAnnotationV1,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { CDFAnnotationV1 } from 'src/api/annotation/types';

export const UpdateAnnotations = createAsyncThunk<
  VisionAnnotationV1[],
  CDFAnnotationV1[],
  ThunkConfig
>('UpdateAnnotations', async (annotations) => {
  if (!annotations.length) {
    return [];
  }

  const filteredAnnotations = annotations.filter((annotation) =>
    validateAnnotation(annotation)
  ); // validate annotations

  const annotationUpdateRequest = {
    items: filteredAnnotations.map((ann) => ({
      id: ann.id,
      update: {
        text: getFieldOrSetNull(ann.text),
        status: getFieldOrSetNull(ann.status),
        region: getFieldOrSetNull(
          ann.region
            ? {
                shape: ann.region.shape,
                vertices: ann.region.vertices,
              }
            : null
        ),
        data: getFieldOrSetNull(ann.data),
      },
    })),
  };
  const response = await AnnotationApi.update(annotationUpdateRequest);
  const responseAnnotations = response.data.items;

  const updatedVisionAnnotations =
    AnnotationUtilsV1.convertToVisionAnnotationsV1(responseAnnotations);
  return updatedVisionAnnotations;
});
