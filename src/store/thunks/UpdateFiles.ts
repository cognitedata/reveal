import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileChangeUpdate, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { createFileState } from 'src/store/util/StateUtils';
import { FileState } from 'src/modules/Upload/uploadedFilesSlice';
import { PopulateAnnotations } from 'src/store/thunks/PopulateAnnotations';

export const UpdateFiles = createAsyncThunk<
  FileState[],
  FileChangeUpdate[],
  ThunkConfig
>('updateFiles', async (params, { dispatch }) => {
  const files = await sdk.files.update(params);
  files.forEach((file) => {
    dispatch(
      PopulateAnnotations({
        fileId: file.id.toString(),
        assetIds: file.assetIds,
      })
    );
  });
  return files.map((fileInfo) => createFileState(fileInfo));
});
