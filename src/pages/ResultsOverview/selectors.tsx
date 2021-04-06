import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store';

export const getDataKitItems = (
  assetsDataKitId: string,
  filesDataKitId: string
) =>
  createSelector(
    (state: RootState) => state.selection.items[assetsDataKitId],
    (state: RootState) => state.selection.items[filesDataKitId],
    (assetDataKit: any, fileDataKit: any) => ({ assetDataKit, fileDataKit })
  );

export const getPnidOptions = createSelector(
  (state: RootState) => state.fileContextualization.pnidOption,
  (pnidOptions: any) => {
    const { partialMatch, grayscale } = pnidOptions;
    return { partialMatch, grayscale };
  }
);

export const getFileContextualizationJobs = createSelector(
  (state: RootState) => state.fileContextualization,
  (fileContextualization: any) => {
    const { parsingJobs, uploadJobs } = fileContextualization;
    return {
      parsingJobs,
      uploadJobs,
    };
  }
);
