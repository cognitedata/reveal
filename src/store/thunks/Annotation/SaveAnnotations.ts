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
import { cognitePlaygroundClient } from 'src/api/annotation/CognitePlaygroundClient';

export const SaveAnnotations = createAsyncThunk<
  VisionAnnotation<VisionAnnotationDataType>[],
  UnsavedVisionAnnotation<VisionAnnotationDataType>[],
  ThunkConfig
>('SaveAnnotations', async (unsavedAnnotations) => {
  const sdk = cognitePlaygroundClient;

  const items = unsavedAnnotations.map((item) => {
    return {
      ...item,
      annotatedResourceType: ANNOTATED_RESOURCE_TYPE,
      creatingApp: CREATING_APP,
      creatingAppVersion: CREATING_APP_VERSION,
      creatingUser: null,
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const annotations = await sdk.annotations.create(items);

  const visionAnnotations: VisionAnnotation<VisionAnnotationDataType>[] = [];
  // visionAnnotations = annotations.map((annotations) =>
  //     convertCDFAnnotationV2ToVisionAnnotations(annotations)
  //   ),
  return visionAnnotations;
});
