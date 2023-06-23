import { createAsyncThunk } from '@reduxjs/toolkit';
import { convertCDFAnnotationToVisionAnnotations } from '@vision/api/annotation/converters';
import { ANNOTATION_FETCH_BULK_SIZE } from '@vision/constants/FetchConstants';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from '@vision/modules/Common/types';
import { ThunkConfig } from '@vision/store/rootReducer';
import { splitListIntoChunks } from '@vision/utils/generalUtils';
import { from, lastValueFrom } from 'rxjs';
import { map, mergeMap, reduce } from 'rxjs/operators';

import sdk from '@cognite/cdf-sdk-singleton';

export const RetrieveAnnotations = createAsyncThunk<
  VisionAnnotation<VisionAnnotationDataType>[],
  { fileIds: number[]; clearCache?: boolean },
  ThunkConfig
>('RetrieveAnnotations', async (payload) => {
  const { fileIds: fetchFileIds } = payload;

  /**
   * fetch new (V2 annotators using sdk)
   */
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
      limit: 1000,
    };
    return sdk.annotations
      .list(annotationListRequest)
      .autoPagingToArray({ limit: Infinity });
  });

  let visionAnnotations: VisionAnnotation<VisionAnnotationDataType>[] = [];
  if (requests.length) {
    const responses = from(requests).pipe(
      mergeMap((request) => from(request)),
      map((annotations) =>
        convertCDFAnnotationToVisionAnnotations(annotations)
      ),
      reduce((allAnnotations, annotationsPerFile) => {
        return allAnnotations.concat(annotationsPerFile);
      })
    );
    visionAnnotations = await lastValueFrom(responses);
  }

  return visionAnnotations;
});
