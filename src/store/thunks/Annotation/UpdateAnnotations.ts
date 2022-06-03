import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { AnnotationChangeById } from '@cognite/sdk-playground';
import { cognitePlaygroundClient } from 'src/api/annotation/CognitePlaygroundClient';

/**
 * ## Example
 * ```typescript
 * dispatch(
 *   UpdateAnnotations([
 *     {
 *       id: 1,
 *       update: {
 *         status: { set: 'approved' },
 *         annotationType: { set: 'images.Classification' },
 *         data: {
 *           set: {
 *             label: 'gauge',
 *           },
 *         },
 *       },
 *     },
 *   ])
 * );
 * ```
 */

export const UpdateAnnotations = createAsyncThunk<
  VisionAnnotation<VisionAnnotationDataType>[],
  AnnotationChangeById[],
  ThunkConfig
>('UpdateAnnotations', async (annotationChangeByIds) => {
  if (!annotationChangeByIds.length) {
    return [];
  }

  const sdk = cognitePlaygroundClient;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const annotations = await sdk.annotations.update(annotationChangeByIds);

  const visionAnnotations: VisionAnnotation<VisionAnnotationDataType>[] = [];
  // visionAnnotations = annotations.map((annotations) =>
  //     convertCDFAnnotationV2ToVisionAnnotations(annotations)
  //   ),
  return visionAnnotations;
});
