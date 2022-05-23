import { createAsyncThunk } from '@reduxjs/toolkit';
import sdk from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { DeleteAnnotationsForDeletedFilesV1 } from 'src/store/thunks/Annotation/DeleteAnnotationsForDeletedFilesV1';

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
  await dispatch(DeleteAnnotationsForDeletedFilesV1(fileIds));
  await sdk.files.delete(fileIds.map((id) => ({ id })));
  if (setIsDeletingState) setIsDeletingState(false);
  return fileIds;
});
