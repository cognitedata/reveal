import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { Annotation } from 'src/api/types';

export const RetrieveAnnotations = createAsyncThunk<
  Annotation[],
  { fileId: number; assetIds: number[] },
  ThunkConfig
>('RetrieveAnnotations', async (payload) => {
  const data = {
    data: {
      filter: {
        annotatedResourceType: 'file',
        linkedResourceType: 'asset',
        annotatedResourceIds: [{ id: payload.fileId }],
        linkedResourceIds: payload.assetIds.map((id) => ({ id })),
      },
    },
  };
  const response = await sdk.post(
    `${sdk.getBaseUrl()}/api/playground/projects/${
      sdk.project
    }/context/annotations/list`,
    data
  );

  return response.data.items;
});
