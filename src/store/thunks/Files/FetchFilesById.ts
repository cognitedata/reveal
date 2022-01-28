import { createAsyncThunk } from '@reduxjs/toolkit';
import sdk from '@cognite/cdf-sdk-singleton';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { createFileState } from 'src/store/util/StateUtils';

export const FetchFilesById = createAsyncThunk<
  VisionFile[],
  number[],
  ThunkConfig
>('FetchFilesById', async (fileIds) => {
  if (!fileIds.length) {
    throw new Error('Provide at least one fileId');
  }
  const files = await sdk.files.retrieve(fileIds.map((id) => ({ id })));
  return files.map((fileInfo) => createFileState(fileInfo));
});
