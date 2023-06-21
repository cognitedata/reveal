import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileChangeUpdate } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { createFileState } from 'src/store/util/StateUtils';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';

export const UpdateFiles = createAsyncThunk<
  VisionFile[],
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
