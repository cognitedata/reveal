import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { splitListIntoChunks } from 'src/utils/generalUtils';
import { ANNOTATION_FETCH_BULK_SIZE } from 'src/constants/FetchConstants';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { from, lastValueFrom } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';
import { convertToVisionAnnotations } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';

export const RetrieveAnnotations = createAsyncThunk<
  VisionAnnotation<VisionAnnotationDataType>[],
  { fileIds: number[]; clearCache?: boolean },
  ThunkConfig
>('RetrieveAnnotationsV1', async (payload) => {
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
      map((annotations) => convertToVisionAnnotations(annotations)),
      reduce((allAnnotations, annotationsPerFile) => {
        return allAnnotations.concat(annotationsPerFile);
      })
    );

    return lastValueFrom(responses);
  }

  return [] as VisionAnnotation<VisionAnnotationDataType>[];
});
