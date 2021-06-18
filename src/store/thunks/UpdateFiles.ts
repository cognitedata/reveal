import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileChangeUpdate, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { createFileState } from 'src/store/util/StateUtils';
import { FileState } from 'src/modules/Common/filesSlice';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';

export const UpdateFiles = createAsyncThunk<
  FileState[],
  FileChangeUpdate[],
  ThunkConfig
>('updateFiles', async (params, { dispatch }) => {
  const files = await sdk.files.update(params);
  dispatch(RetrieveAnnotations(files.map((file) => file.id)));
  return files.map((fileInfo) => createFileState(fileInfo));
});
