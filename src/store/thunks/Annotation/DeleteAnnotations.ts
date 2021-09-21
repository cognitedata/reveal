import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';

export const DeleteAnnotations = createAsyncThunk<void, number[], ThunkConfig>(
  'DeleteAnnotations',
  async (annotationIds) => {
    if (annotationIds && annotationIds.length) {
      const data = {
        data: {
          items: annotationIds.map((id) => ({ id })),
        },
      };
      await sdk.post(
        `${sdk.getBaseUrl()}/api/playground/projects/${
          sdk.project
        }/context/annotations/delete`,
        data
      );
    }
  }
);
