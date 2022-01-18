/* eslint-disable no-param-reassign */
import { FileState, VisionFile } from './types';

export const deleteFileById = (state: FileState, id: number) => {
  state.files.selectedIds = state.files.selectedIds.filter(
    (item) => item !== id
  );
  delete state.files.byId[id];
  state.files.allIds = Object.keys(state.files.byId).map((key) => +key);
};

export const updateFileState = (state: FileState, file: VisionFile) => {
  const hasInState = !!state.files.byId[file.id];
  state.files.byId[file.id] = file;
  if (!hasInState) {
    state.files.allIds.push(file.id);
  }
};

export const clearFilesState = (state: FileState) => {
  // TODO: is this even in use?
  state.files.byId = {};
  state.files.allIds = [];
  state.files.selectedIds = [];
};
