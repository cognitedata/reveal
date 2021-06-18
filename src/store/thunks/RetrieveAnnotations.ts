import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { AnnotationUtils, VisionAnnotation } from 'src/utils/AnnotationUtils';

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
    const visionAnnotations =
      AnnotationUtils.convertToVisionAnnotations(annotations);
    return visionAnnotations;
  }
  return [];
});
