import { VisionFile } from 'src/modules/Common/store/files/types';
import { ExplorerFileState, ExplorerState } from 'src/modules/Explorer/types';

/* eslint-disable no-param-reassign */
export const deleteFileById = (state: ExplorerState, id: number) => {
  delete state.files.byId[id];
  state.files.allIds = Object.keys(state.files.byId).map((fid) => +fid);
};

export const updateFileState = (state: ExplorerState, file: VisionFile) => {
  const hasInState = !!state.files.byId[+file.id];
  state.files.byId[+file.id] = convertToExplorerFileState(file);
  if (!hasInState) {
    state.files.allIds.push(+file.id);
  }
};

export const resetFileState = (state: ExplorerState) => {
  state.files.byId = {};
  state.files.allIds = [];
  state.files.selectedIds = [];
};

export const convertToExplorerFileState = (
  fileState: VisionFile
): ExplorerFileState => {
  return { ...fileState };
};

export const resetSortPagination = (state: ExplorerState) => {
  // Workaround: rest sortKey, since annotations need to be refetched
  state.sortMeta.sortKey = '';
  state.sortMeta.currentPage = 1;
};
