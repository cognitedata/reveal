import { StoreState } from 'store/types';
import { FilesUploadState, FormState, ImageFileState } from './types';

export const formState = (state: StoreState): FormState => state.form;

export const imageFileState = (state: StoreState): ImageFileState =>
  state.form.imageFile;

export const filesUploadState = (state: StoreState): FilesUploadState =>
  state.form.files;
