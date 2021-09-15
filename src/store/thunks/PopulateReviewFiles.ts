import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { clearFileState } from 'src/store/commonActions';
import { setReviewFileIds } from 'src/modules/Review/previewSlice';

export const PopulateReviewFiles = createAsyncThunk<
  void,
  number[],
  ThunkConfig
>('PopulateReviewFiles', async (fileIds, { getState, dispatch }) => {
  const reviewState = getState().previewSlice;
  const previousFileList = reviewState.fileIds;
  const removeFileList = previousFileList.filter((id) => !fileIds.includes(id));
  dispatch(setReviewFileIds(fileIds));
  if (removeFileList) {
    dispatch(clearFileState(removeFileList));
  }
});
