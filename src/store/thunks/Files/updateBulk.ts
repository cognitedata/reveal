import { Label } from '@cognite/cdf-sdk-singleton';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BulkEditTempState } from 'src/modules/Common/store/commonSlice';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { UpdateFiles } from './UpdateFiles';

export const updateBulk = createAsyncThunk<
  void,
  { selectedFiles: VisionFile[]; bulkEditTemp: BulkEditTempState },
  ThunkConfig
>('updateBulk', async ({ selectedFiles, bulkEditTemp }, { dispatch }) => {
  const payload: {
    id: number;
    update: {};
  }[] = selectedFiles.map((file) => {
    const { id } = file;
    const addedLabels: Label[] = bulkEditTemp.labels || [];

    const updatedMetadata = bulkEditTemp.metadata;
    const newMetadata = updatedMetadata
      ? Object.keys(updatedMetadata)
          .filter((key) => !!updatedMetadata[key])
          .reduce(
            (res, key) => Object.assign(res, { [key]: updatedMetadata[key] }),
            {}
          )
      : {};

    return {
      id,
      update: {
        labels: { add: addedLabels },
        metadata: { add: newMetadata },
      },
    };
  });
  await dispatch(UpdateFiles(payload));
});
