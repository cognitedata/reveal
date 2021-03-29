import { createAsyncThunk } from '@reduxjs/toolkit';
import { InternalId, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { updateLinkedAssets } from 'src/store/thunks/updateLinkedAssets';
import { setUploadedFiles } from 'src/store/uploadedFilesSlice';

export const fetchFilesById = createAsyncThunk<void, InternalId[], ThunkConfig>(
  'uploadedFiles/fetchFiles',
  async (fileIds, { dispatch }) => {
    if (!fileIds.length) {
      throw new Error('Provide at least one fileId');
    }
    const files = await sdk.files.retrieve(fileIds);
    dispatch(setUploadedFiles(files));
    files.forEach((file) => {
      dispatch(
        updateLinkedAssets({
          fileId: file.id.toString(),
          assetIds: file.assetIds,
        })
      );
    });
  }
);
