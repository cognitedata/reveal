import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileChangeUpdate, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { FileState } from 'src/modules/Common/store/filesSlice';
import { ThunkConfig } from 'src/store/rootReducer';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { createFileState } from 'src/store/util/StateUtils';

export const UpdateFiles = createAsyncThunk<
  FileState[],
  FileChangeUpdate[],
  ThunkConfig
>('updateFiles', async (params, { dispatch }) => {
  const files = await sdk.files.update(params);
  dispatch(
    RetrieveAnnotations({
      fileIds: files.map((file) => file.id),
      clearCache: false,
    })
  );
  return files.map((fileInfo) => createFileState(fileInfo));
});
