import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AnnotationJob } from 'src/api/types';
import { InternalId, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { setUploadedFiles } from 'src/store/uploadedFilesSlice';
import { RootState } from 'src/store/rootReducer';

export type ThunkConfig = { state: RootState };

export const fileProcessUpdate = createAction<{
  fileId: string | number;
  job: AnnotationJob;
}>('fileProcessUpdate');

export const fetchFilesById = createAsyncThunk<void, InternalId[], ThunkConfig>(
  'uploadedFiles/fetchFiles',
  async (fileIds, { dispatch }) => {
    if (!fileIds.length) {
      throw new Error('Provide at least one fileId');
    }
    const files = await sdk.files.retrieve(fileIds);
    dispatch(setUploadedFiles({ uploadedFiles: files }));
  }
);
