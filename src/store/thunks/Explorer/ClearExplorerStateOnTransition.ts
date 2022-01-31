import { createAsyncThunk } from '@reduxjs/toolkit';
import { resetExplorerTemporaryState } from 'src/modules/Explorer/store/slice';
import { clearExplorerFileState } from 'src/store/commonActions';
import { ThunkConfig } from 'src/store/rootReducer';

export const ClearExplorerStateOnTransition = createAsyncThunk<
  void,
  void,
  ThunkConfig
>('ClearExplorerStateOnTransition', async (fileIds, { getState, dispatch }) => {
  const explorerFiles = getState().explorerReducer.files;
  const removeFileList = explorerFiles.allIds;
  if (removeFileList.length) {
    dispatch(clearExplorerFileState(removeFileList));
  }
  dispatch(resetExplorerTemporaryState());
});
