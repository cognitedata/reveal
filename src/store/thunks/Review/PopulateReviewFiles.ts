import { createAsyncThunk } from '@reduxjs/toolkit';
import { setReviewFileIds } from 'src/modules/Review/store/reviewSlice';
import { ThunkConfig } from 'src/store/rootReducer';
import { clearAnnotationState, clearFileState } from 'src/store/commonActions';

export const PopulateReviewFiles = createAsyncThunk<
  void,
  number[],
  ThunkConfig
>('PopulateReviewFiles', async (fileIds, { getState, dispatch }) => {
  const reviewState = getState().reviewSlice;
  const processState = getState().processSlice;
  const previousReviewFileList = reviewState.fileIds;
  const processFileList = processState.fileIds;
  const removeFileList = previousReviewFileList.filter(
    // this check is done since navigating to Review is possible by explorer page, if this is not done clearFileState will remove files from existing files in process page
    (id) => !fileIds.includes(id) && !processFileList.includes(id)
  );
  dispatch(setReviewFileIds(fileIds));
  if (removeFileList) {
    dispatch(clearFileState(removeFileList));
    dispatch(clearAnnotationState(removeFileList));
  }
});
