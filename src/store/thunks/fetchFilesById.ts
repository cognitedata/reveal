import { createAsyncThunk } from '@reduxjs/toolkit';
import { InternalId, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { setUploadedFiles } from 'src/modules/Common/filesSlice';

export const fetchFilesById = createAsyncThunk<void, InternalId[], ThunkConfig>(
  'fetchFilesById',
  async (fileIds, { dispatch }) => {
    if (!fileIds.length) {
      throw new Error('Provide at least one fileId');
    }
    const files = await sdk.files.retrieve(fileIds);
    dispatch(setUploadedFiles(files));
  }
);
