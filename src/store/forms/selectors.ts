import { Suite } from 'store/suites/types';
import { StoreState } from 'store/types';
import {
  BoardState,
  FilesUploadState,
  FormState,
  ImageFileState,
} from './types';

export const isErrorListEmpty = (state: StoreState): boolean =>
  state.form.isErrorListEmpty;

export const suiteState = (state: StoreState): Suite => state.form.suite;

export const boardState = (state: StoreState): BoardState => state.form.board;

export const formState = (state: StoreState): FormState => state.form;

export const imageFileState = (state: StoreState): ImageFileState =>
  state.form.imageFile;

export const filesUploadState = (state: StoreState): FilesUploadState =>
  state.form.files;
