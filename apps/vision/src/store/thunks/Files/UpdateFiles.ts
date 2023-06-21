import { createAsyncThunk } from '@reduxjs/toolkit';
import { VisionFile } from '@vision/modules/Common/store/files/types';
import { ThunkConfig } from '@vision/store/rootReducer';
import { RetrieveAnnotations } from '@vision/store/thunks/Annotation/RetrieveAnnotations';
import { createFileState } from '@vision/store/util/StateUtils';

import sdk from '@cognite/cdf-sdk-singleton';
import { FileChangeUpdate } from '@cognite/sdk';

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
