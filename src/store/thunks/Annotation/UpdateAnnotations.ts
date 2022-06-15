import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { AnnotationChangeById } from '@cognite/sdk-playground';
import { cognitePlaygroundClient as sdk} from 'src/api/annotation/CognitePlaygroundClient';
import { convertCDFAnnotationToVisionAnnotations } from 'src/api/annotation/converters';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const annotations = await sdk.annotations.update(annotationChangeByIds);

  const visionAnnotations: VisionAnnotation<VisionAnnotationDataType>[] =
    convertCDFAnnotationToVisionAnnotations(annotations);
  return visionAnnotations;
});
