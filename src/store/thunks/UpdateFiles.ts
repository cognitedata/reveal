import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileChangeUpdate, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { createFileState } from 'src/store/util/StateUtils';
import { FileState } from 'src/store/uploadedFilesSlice';
import { updateLinkedAssets } from 'src/store/thunks/updateLinkedAssets';

export const UpdateFiles = createAsyncThunk<
  FileState[],
  FileChangeUpdate[],
  ThunkConfig
>('updateFiles', async (params, { dispatch }) => {
  const files = await sdk.files.update(params);
  files.forEach((file) => {
    dispatch(
      updateLinkedAssets({
        fileId: file.id.toString(),
        assetIds: file.assetIds,
      })
    );
  });
  return files.map((fileInfo) => createFileState(fileInfo));
});
