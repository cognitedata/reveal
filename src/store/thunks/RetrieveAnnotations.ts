import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { AnnotationUtils, VisionAnnotation } from 'src/utils/AnnotationUtils';
import { Annotation } from 'src/api/types';
import { validateAnnotation } from 'src/api/utils';

export const RetrieveAnnotations = createAsyncThunk<
  VisionAnnotation[],
  number[],
  ThunkConfig
>('RetrieveAnnotations', async (payload) => {
  const requests = payload.map((fileId) => {
    const filterPayload: any = {
      annotatedResourceType: 'file',
      annotatedResourceIds: [{ id: fileId }],
    };
    const annotationListRequest = {
      filter: filterPayload,
    };
    return AnnotationApi.list(annotationListRequest);
  });

  if (requests.length) {
    const responses = await Promise.all(requests);
    const annotationsPerResponse = responses.map(
      (res) => res?.data?.items || []
    );
    const annotations = annotationsPerResponse.reduce((acc, rs) => {
      return acc.concat(rs);
    });
    const filteredAnnotations = annotations.filter((annotation: Annotation) => {
      try {
        return validateAnnotation(annotation);
      } catch (error) {
        console.error(
          'Annotation is invalid!, will not be visible',
          annotation
        );
        return false;
      }
    });
    const visionAnnotations =
      AnnotationUtils.convertToVisionAnnotations(filteredAnnotations);
    return visionAnnotations;
  }
  return [];
});
