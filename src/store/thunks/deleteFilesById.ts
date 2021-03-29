import { createAsyncThunk } from '@reduxjs/toolkit';
import { InternalId, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';

export const deleteFilesById = createAsyncThunk<
  InternalId[],
  InternalId[],
  ThunkConfig
>('uploadedFiles/deleteFileById', async (fileIds) => {
  if (!fileIds) {
    throw new Error('Ids not provided!');
  }
  await sdk.files.delete(fileIds);
  return fileIds;
});
