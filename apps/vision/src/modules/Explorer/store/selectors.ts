import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '../../../store/rootReducer';
import { createFileInfo } from '../../../store/util/StateUtils';
import { GenericSort, SortKeys } from '../../Common/Utils/SortUtils';
import { ExplorerState } from '../types';

export const selectExplorerSelectedIds = (state: ExplorerState): number[] =>
  state.files.selectedIds;

export const selectExploreFileCount = (state: ExplorerState): number =>
  state.files.allIds.length;

export const selectExplorerAllFiles = createSelector(
  (state: ExplorerState) => state.files.allIds,
  (state: ExplorerState) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.map((id) => createFileInfo(allFiles[id]));
  }
);

export const selectExplorerAllFilesSelected = createSelector(
  (state: ExplorerState) => state.files.allIds,
  selectExplorerSelectedIds,
  (allIds, selectedFileIds) => {
    return (
      !!allIds.length && allIds.every((id) => selectedFileIds.includes(id))
    );
  }
);

export const selectExplorerFilesWithAnnotationCount = createSelector(
  (state: RootState) => selectExplorerAllFiles(state.explorerReducer),
  (state: RootState) => state.annotationReducer.files.byId,
  (explorerAllFiles, allAnnotationFiles) => {
    return explorerAllFiles.map((file) => {
      return {
        ...file,
        annotationCount: allAnnotationFiles[file.id]
          ? allAnnotationFiles[file.id].length
          : 0,
      };
    });
  }
);

export const selectExplorerSortedFiles = createSelector(
  selectExplorerFilesWithAnnotationCount,
  (rootState: RootState) => rootState.explorerReducer.sortMeta.sortKey,
  (rootState: RootState) => rootState.explorerReducer.sortMeta.reverse,
  GenericSort
);

export const selectExplorerSelectedFileIdsInSortedOrder = createSelector(
  selectExplorerSortedFiles,
  (rootState: RootState) =>
    selectExplorerSelectedIds(rootState.explorerReducer),
  (sortedFiles, selectedIds) => {
    const indexMap = new Map<number, number>(
      sortedFiles.map((item: any, index) => [item.id, index])
    );

    const sortedIds = GenericSort(
      selectedIds,
      SortKeys.indexInSortedArray,
      false,
      indexMap
    );

    return sortedIds;
  }
);

export const selectExplorerAllSelectedFilesInSortedOrder = createSelector(
  selectExplorerSelectedFileIdsInSortedOrder,
  (rootState: RootState) => rootState.explorerReducer.files.byId,
  (sortedSelectedFileIds, allFiles) => {
    return sortedSelectedFileIds.map((id) => allFiles[id]);
  }
);
