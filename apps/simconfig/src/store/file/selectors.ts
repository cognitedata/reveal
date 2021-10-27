import { StoreState } from 'store/types';

export const selectFiles = (state: StoreState) => state.file.files;
export const selectSelectedFile = (state: StoreState) =>
  state.file.selectedFile;

export const selectSelectedCalculation = (state: StoreState) =>
  state.file.selectedCalculation;

export const selectIsFilesInitialized = (state: StoreState) =>
  state.file.initialized;

export const selectDownloadLinks = (state: StoreState) =>
  state.file.downloadLinks;
