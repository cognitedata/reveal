import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { setProcessFileIds } from 'src/modules/Process/store/slice';
import { clearAnnotationState, clearFileState } from 'src/store/commonActions';

export const PopulateProcessFiles = createAsyncThunk<
  void,
  number[],
  ThunkConfig
>('PopulateProcessFiles', async (fileIds, { getState, dispatch }) => {
  const processState = getState().processSlice;
  const previousFileList = processState.fileIds;
  const removeFileList = previousFileList.filter((id) => !fileIds.includes(id));
  dispatch(setProcessFileIds(fileIds));
  if (removeFileList) {
    dispatch(clearFileState(removeFileList));
    dispatch(clearAnnotationState(previousFileList));
  }
});
