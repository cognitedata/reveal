import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import {
  AnnotationUtilsV1,
  VisionAnnotationV1,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { CDFAnnotationV1 } from 'src/api/annotation/types';
import { validateAnnotation } from 'src/api/annotation/utils';
import { ANNOTATION_FETCH_BULK_SIZE } from 'src/constants/FetchConstants';
import { splitListIntoChunks } from 'src/utils/generalUtils';
import { from, lastValueFrom } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

export const RetrieveAnnotations = createAsyncThunk<
  VisionAnnotationV1[],
  { fileIds: number[]; clearCache?: boolean },
  ThunkConfig
>('RetrieveAnnotations', async (payload) => {
  const { fileIds: fetchFileIds } = payload;
  const fileIdBatches = splitListIntoChunks(
    fetchFileIds,
    ANNOTATION_FETCH_BULK_SIZE
  );
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
    const responses = from(requests).pipe(
      mergeMap((request) => from(request)),
      map((annotations) => {
        const filteredAnnotations = annotations.filter(
          (annotation: CDFAnnotationV1) => {
            try {
              return validateAnnotation(annotation);
            } catch (error) {
              console.warn(
                'Annotation is invalid, will not be visible',
                annotation
              );
              return false;
            }
          }
        );
        const visionAnnotations =
          AnnotationUtilsV1.convertToVisionAnnotationsV1(filteredAnnotations);
        return visionAnnotations;
      }),
      reduce((allAnnotations, annotationsPerFile) => {
        return allAnnotations.concat(annotationsPerFile);
      })
    );

    return lastValueFrom(responses);
  }
  return [];
});
