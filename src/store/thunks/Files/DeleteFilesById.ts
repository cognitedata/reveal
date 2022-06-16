import { createAsyncThunk } from '@reduxjs/toolkit';
import sdk from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { DeleteAnnotationsForDeletedFiles } from 'src/store/thunks/Annotation/DeleteAnnotationsForDeletedFiles';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const SLEEP_DELAY_MS = 800;

export const DeleteFilesById = createAsyncThunk<
  number[],
  { fileIds: number[]; setIsDeletingState?: (val: boolean) => void },
  ThunkConfig
>('DeleteFilesById', async (fileData, { dispatch }) => {
  const { fileIds, setIsDeletingState } = fileData;
  if (!fileIds || !fileIds.length) {
    throw new Error('Ids not provided!');
  }
  if (setIsDeletingState) setIsDeletingState(true);
  await dispatch(
    DeleteAnnotationsForDeletedFiles(fileIds.map((item) => ({ id: item })))
  );
  await sdk.files.delete(fileIds.map((id) => ({ id })));
  // Add a small delay to give Files API time to know that the file has been deleted
  await sleep(SLEEP_DELAY_MS);
  if (setIsDeletingState) setIsDeletingState(false);
  return fileIds;
});
