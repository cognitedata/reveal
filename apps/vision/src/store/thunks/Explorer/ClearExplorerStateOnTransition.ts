import { createAsyncThunk } from '@reduxjs/toolkit';

import { resetExplorerTemporaryState } from '../../../modules/Explorer/store/slice';
import {
  clearAnnotationState,
  clearExplorerFileState,
} from '../../commonActions';
import { ThunkConfig } from '../../rootReducer';

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
