import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { AnnotationUtils, VisionAnnotation } from 'src/utils/AnnotationUtils';
import { Annotation } from 'src/api/types';
import { validateAnnotation } from 'src/api/utils';
import chunk from 'lodash-es/chunk';
import { ANNOTATION_FETCH_BULK_SIZE } from 'src/constants/FetchConstants';

export const RetrieveAnnotations = createAsyncThunk<
  VisionAnnotation[],
  number[],
  ThunkConfig
>('RetrieveAnnotations', async (payload) => {
  const fileIdBatches = chunk(payload, ANNOTATION_FETCH_BULK_SIZE);
  const requests = fileIdBatches.map((fileIds) => {
    const filterPayload: any = {
      annotatedResourceType: 'file',
      annotatedResourceIds: fileIds.map((id) => ({ id })),
    };
    const annotationListRequest = {
      filter: filterPayload,
      limit: -1,
    };

    return AnnotationApi.list(annotationListRequest);
  });
  if (requests.length) {
    const responses = await Promise.all(requests);
    const annotations = responses.reduce((acc, rs) => {
      return acc.concat(rs);
    });
    const filteredAnnotations = annotations.filter((annotation: Annotation) => {
      try {
        return validateAnnotation(annotation);
      } catch (error) {
        console.error('Annotation is invalid, will not be visible', annotation);
        return false;
      }
    });

    const visionAnnotations =
      AnnotationUtils.convertToVisionAnnotations(filteredAnnotations);
    return visionAnnotations;
  }
  return [];
});
