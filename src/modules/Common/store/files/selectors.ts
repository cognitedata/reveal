import { createSelector } from '@reduxjs/toolkit';
import isEqual from 'lodash-es/isEqual';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import { createFileInfo } from 'src/store/util/StateUtils';
import { FileState } from './types';

export const selectAllSelectedIds = (state: FileState): number[] =>
  state.files.selectedIds;

export const selectAllFiles = createSelector(
  (state: FileState) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.map((id) => createFileInfo(allFiles[id]));
  }
);

export const selectAllFilesSelected = createSelector(
  (state: FileState) => state.files.allIds,
  (state: FileState, args: { overridedFileIds?: number[] }) => args,
  selectAllSelectedIds,
  (allIds, args, selectedFileIds) => {
    const allIdsToSelectFrom = args.overridedFileIds || allIds;
    return (
      !!allIdsToSelectFrom.length &&
      allIdsToSelectFrom.every((id) => selectedFileIds.includes(id))
    );
  }
);

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const selectFileById = createDeepEqualSelector(
  (_: FileState, fileId: number) => fileId,
  (state) => state.files.byId,
  (fileId, files) => {
    const file = files[fileId];
    return file ? createFileInfo(file) : null;
  }
);
