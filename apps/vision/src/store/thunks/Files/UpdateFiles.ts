import { createAsyncThunk } from '@reduxjs/toolkit';

import sdk from '@cognite/cdf-sdk-singleton';
import { FileChangeUpdate } from '@cognite/sdk';

import { VisionFile } from '../../../modules/Common/store/files/types';
import { ThunkConfig } from '../../rootReducer';
import { createFileState } from '../../util/StateUtils';
import { RetrieveAnnotations } from '../Annotation/RetrieveAnnotations';

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
