import { createAsyncThunk } from '@reduxjs/toolkit';

import sdk from '@cognite/cdf-sdk-singleton';
import { AnnotationChangeById } from '@cognite/sdk';

import { convertCDFAnnotationToVisionAnnotations } from '../../../api/annotation/converters';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from '../../../modules/Common/types';
import { ThunkConfig } from '../../rootReducer';

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
  const updatedAnnotations = await sdk.annotations.update(
    annotationChangeByIds
  );

  const updatedVisionAnnotations: VisionAnnotation<VisionAnnotationDataType>[] =
    convertCDFAnnotationToVisionAnnotations(updatedAnnotations);
  return updatedVisionAnnotations;
});
