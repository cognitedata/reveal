import { createAsyncThunk } from '@reduxjs/toolkit';
import { VisionFile } from '@vision/modules/Common/store/files/types';
import { ThunkConfig } from '@vision/store/rootReducer';
import { createFileState } from '@vision/store/util/StateUtils';

import sdk from '@cognite/cdf-sdk-singleton';

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
