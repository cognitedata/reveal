import { createAsyncThunk } from '@reduxjs/toolkit';
import { resetExplorerTemporaryState } from '@vision/modules/Explorer/store/slice';
import {
  clearAnnotationState,
  clearExplorerFileState,
} from '@vision/store/commonActions';
import { ThunkConfig } from '@vision/store/rootReducer';

export const ClearExplorerStateOnTransition = createAsyncThunk<
  void,
  void,
  ThunkConfig
>('ClearExplorerStateOnTransition', async (fileIds, { getState, dispatch }) => {
  const explorerFiles = getState().explorerReducer.files;
  const removeFileList = explorerFiles.allIds;
  if (removeFileList.length) {
    dispatch(clearExplorerFileState(removeFileList));
    dispatch(clearAnnotationState(removeFileList));
  }
  dispatch(resetExplorerTemporaryState());
});
