import { FileDetailsState } from 'src/modules/FileDetails/types';

export const resetEditHistoryState = (state: FileDetailsState) => {
  /* eslint-disable no-param-reassign */
  state.metadataEdit = false;
  state.fileMetaData = {};
  state.fileDetails = {};
};
