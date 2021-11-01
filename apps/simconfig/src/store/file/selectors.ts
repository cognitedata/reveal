import { StoreState } from 'store/types';

export const selectFiles = (state: StoreState) => state.file.files;
export const selectSelectedFile = (state: StoreState) =>
  state.file.selectedFile;

export const selectSelectedCalculation = (state: StoreState) =>
  state.file.currentCalculation;

export const selectSelectedCalculationConfig = (state: StoreState) =>
  state.file.currentCalculationConfig;

export const selectIsFilesInitialized = (state: StoreState) =>
  state.file.initialized;

export const selectDownloadLinks = (state: StoreState) =>
  state.file.downloadLinks;
