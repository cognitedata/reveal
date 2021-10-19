import { StoreState } from 'store/types';

export const selectFiles = (state: StoreState) => state.file.files;
export const selectSelectedFile = (state: StoreState) =>
  state.file.selectedFile;
