import { Label } from '@cognite/cdf-sdk-singleton';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { FileState } from 'src/modules/Common/filesSlice';
import { BulkEditTempState } from 'src/modules/Explorer/store/explorerSlice';
import { ThunkConfig } from '../rootReducer';
import { UpdateFiles } from './UpdateFiles';

export const updateBulk = createAsyncThunk<
  void,
  { selectedFiles: FileState[]; bulkEditTemp: BulkEditTempState },
  ThunkConfig
>('updateBulk', async ({ selectedFiles, bulkEditTemp }, { dispatch }) => {
  const payload: {
    id: number;
    update: {};
  }[] = selectedFiles.map((file) => {
    const { id } = file;
    const addedLabels: Label[] = bulkEditTemp.labels || [];
    return { id, update: { labels: { add: addedLabels } } };
  });
  await dispatch(UpdateFiles(payload));
});
