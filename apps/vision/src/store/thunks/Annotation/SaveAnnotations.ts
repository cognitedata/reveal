import { createAsyncThunk } from '@reduxjs/toolkit';
import { convertCDFAnnotationToVisionAnnotations } from '@vision/api/annotation/converters';
import {
  ANNOTATED_RESOURCE_TYPE,
  CREATING_APP,
  CREATING_APP_VERSION,
} from '@vision/constants/annotationMetadata';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
  UnsavedVisionAnnotation,
} from '@vision/modules/Common/types';
import { ThunkConfig } from '@vision/store/rootReducer';

import sdk from '@cognite/cdf-sdk-singleton';

export const SaveAnnotations = createAsyncThunk<
  VisionAnnotation<VisionAnnotationDataType>[],
  UnsavedVisionAnnotation<VisionAnnotationDataType>[],
  ThunkConfig
>('SaveAnnotations', async (unsavedAnnotations) => {
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
});
