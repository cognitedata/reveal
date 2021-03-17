import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store';
import { FileInfo, Asset } from '@cognite/sdk';
import { itemSelector as fileSelector } from 'modules/files';
import { itemSelector as assetSelector } from 'modules/assets';
import {
  annotationsDefaultState,
  linkedFilesDefaultState,
} from 'modules/annotations';

export const linkedFilesSelectorByAssetId = createSelector(
  (state: RootState) => state.annotations.byAssetId,
  fileSelector,
  (assetIdMap: any, files: any) => (assetId: number | undefined) => {
    if (!assetId || !assetIdMap[assetId]) {
      return {
        ...linkedFilesDefaultState,
        fileIds: [],
        files: [],
      };
    }
    const { fileIds } = assetIdMap[assetId];
    return {
      ...assetIdMap[assetId],
      files: (fileIds || [])
        .map((id: string) => files(id))
        .filter((el: any) => !!el) as FileInfo[],
    };
  }
);
export const linkedFilesSelectorByFileId = createSelector(
  (state: RootState) => state.annotations.byFileId,
  fileSelector,
  (annotationsMap: any, filesMap: any) => (fileId: number | undefined) => {
    if (!fileId || !annotationsMap || !annotationsMap[fileId]) {
      return {
        ...linkedFilesDefaultState,
        fileIds: [] as (string | number)[],
        files: [],
      };
    }
    const { annotations } = annotationsMap[fileId];
    const fileIdsSet = new Set<number | string>();
    annotations.forEach((el: any) => {
      if (el.resourceType === 'file') {
        fileIdsSet.add(el.resourceExternalId || el.resourceId!);
      }
    });
    const fileIds = [...fileIdsSet];
    return {
      ...annotationsMap[fileId],
      fileIds,
      files: fileIds
        .map((id) => filesMap(id))
        .filter((el) => !!el) as FileInfo[],
    };
  }
);

export const linkedAssetsSelector = createSelector(
  (state: RootState) => state.annotations.byFileId,
  assetSelector,
  (fileIdMap: any, assetIdMap: any) => (fileId: number | undefined) => {
    if (!fileId || !fileIdMap[fileId]) {
      return {
        ...annotationsDefaultState,
        assetIds: [],
        assets: [],
      };
    }
    const { annotations } = fileIdMap[fileId];
    const assetIdsMap = new Set<number | string>();
    annotations.forEach((el: any) => {
      if (el.resourceType === 'asset') {
        assetIdsMap.add(el.resourceExternalId || el.resourceId!);
      }
    });
    const assetIds = [...assetIdsMap];
    return {
      ...fileIdMap[fileId],
      assetIds,
      assets: assetIds
        .map((id) => assetIdMap(id) as any)
        .filter((el) => !!el) as Asset[],
    };
  }
);

export const selectAnnotations = createSelector(
  (state: RootState) => state.annotations.byFileId,
  (annotationMap) => (fileId?: number, includeDeleted = false) => {
    if (!fileId) {
      return [];
    }
    const items = (annotationMap[fileId] || {}).annotations || [];
    if (includeDeleted) {
      return items;
    }
    return items.filter((el: any) => el.status !== 'deleted');
  }
);

export const selectAnnotationsForSource = createSelector(
  selectAnnotations,
  (annotationSelector) => (
    fileId: number,
    source: string,
    includeDeleted = false
  ) => {
    const items = annotationSelector(fileId, includeDeleted);
    return items.filter((el: any) => el.source === source);
  }
);
