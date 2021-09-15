import { createAsyncThunk } from '@reduxjs/toolkit';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { FileState } from 'src/modules/Common/filesSlice';
import { createFileState } from 'src/store/util/StateUtils';

export const FetchFilesById = createAsyncThunk<
  FileState[],
  number[],
  ThunkConfig
>('FetchFilesById', async (fileIds) => {
  if (!fileIds.length) {
    throw new Error('Provide at least one fileId');
  }
  const files = await sdk.files.retrieve(fileIds.map((id) => ({ id })));
  return files.map((fileInfo) => createFileState(fileInfo));
});
