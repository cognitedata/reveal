import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { Annotation } from 'src/api/types';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';

export const UpdateAnnotations = createAsyncThunk<
  Annotation[],
  Annotation[],
  ThunkConfig
>('UpdateAnnotations', async (annotations) => {
  const annotationUpdateRequest = {
    items: annotations.map((ann) => ({
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
  return response.data.items;
});

const getFieldOrSetNull = (value: any): { set: any } | { setNull: true } => {
  if (value === undefined || value === null) {
    return {
      setNull: true,
    };
  }
  return {
    set: value,
  };
};
