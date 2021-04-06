import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { Annotation } from 'src/api/types';

export const RetrieveAnnotations = createAsyncThunk<
  Annotation[],
  { fileId: number; assetIds: number[] | undefined },
  ThunkConfig
>('RetrieveAnnotations', async (payload) => {
  let filterPayload: any = {
    annotatedResourceType: 'file',
    annotatedResourceIds: [{ id: payload.fileId }],
  };
  if (payload.assetIds && payload.assetIds.length) {
    filterPayload = {
      ...filterPayload,
      linkedResourceType: 'asset',
      linkedResourceIds: payload.assetIds.map((id) => ({ id })),
    };
  }
  const data = {
    data: {
      filter: filterPayload,
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
