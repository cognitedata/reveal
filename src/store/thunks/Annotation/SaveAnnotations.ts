import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';

import {
  VisionAnnotation,
  VisionAnnotationDataType,
  UnsavedVisionAnnotation,
} from 'src/modules/Common/types';
import {
  ANNOTATED_RESOURCE_TYPE,
  CREATING_APP,
  CREATING_APP_VERSION,
} from 'src/constants/annotationMetadata';
import { cognitePlaygroundClient as sdk } from 'src/api/annotation/CognitePlaygroundClient';
import { convertCDFAnnotationToVisionAnnotations } from 'src/api/annotation/converters';

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
