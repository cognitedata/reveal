import { createAsyncThunk } from '@reduxjs/toolkit';

import sdk from '@cognite/cdf-sdk-singleton';

import { convertCDFAnnotationToVisionAnnotations } from '../../../api/annotation/converters';
import {
  ANNOTATED_RESOURCE_TYPE,
  CREATING_APP,
  CREATING_APP_VERSION,
} from '../../../constants/annotationMetadata';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
  UnsavedVisionAnnotation,
} from '../../../modules/Common/types';

export const SaveAnnotations = createAsyncThunk(
  'SaveAnnotations',
  async (
    unsavedAnnotations: UnsavedVisionAnnotation<VisionAnnotationDataType>[]
  ) => {
    const annotations = await sdk.annotations.create(
      unsavedAnnotations.map((ann) => ({
        ...ann,
        annotatedResourceType: ANNOTATED_RESOURCE_TYPE,
        creatingApp: CREATING_APP,
        creatingAppVersion: CREATING_APP_VERSION,
        creatingUser: null,
      }))
    );
    const visionAnnotations: VisionAnnotation<VisionAnnotationDataType>[] =
      convertCDFAnnotationToVisionAnnotations(annotations);
    return visionAnnotations;
  }
);
