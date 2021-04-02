import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { UnsavedAnnotation } from 'src/utils/AnnotationUtils';

export const SaveAnnotations = createAsyncThunk<
  void,
  UnsavedAnnotation[],
  ThunkConfig
>('SaveAnnotations', async (annotations) => {
  const data = {
    data: { items: annotations },
  };
  await sdk.post(
    `${sdk.getBaseUrl()}/api/playground/projects/${
      sdk.project
    }/context/annotations`,
    data
  );
});
