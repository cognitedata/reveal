import isEmpty from 'lodash/isEmpty';

import { FavoriteContentWells } from '../../modules/favorite/types';

export const isSetFavoredInWells = (
  selectedWells: FavoriteContentWells | undefined,
  favoriteWells: FavoriteContentWells
) => {
  if (
    selectedWells &&
    !isEmpty(Object.keys(selectedWells)) &&
    !isEmpty(Object.keys(favoriteWells))
  ) {
    return Object.keys(selectedWells).every((wellId) => {
      if (favoriteWells[wellId]) {
        if (isEmpty(favoriteWells[wellId])) {
          return true;
        }

        return selectedWells[wellId].every((wellboreId) =>
          favoriteWells[wellId].includes(String(wellboreId))
        );
      }

      return false;
    });
  }

  return false;
};

export const isSetFavoredInDocuments = (
  selectedDocumentIds: number[] | undefined,
  favoriteDocumentIds: number[]
) => {
  if (
    selectedDocumentIds &&
    !isEmpty(selectedDocumentIds) &&
    !isEmpty(favoriteDocumentIds)
  ) {
    return selectedDocumentIds.every((documentId) =>
      favoriteDocumentIds.includes(documentId)
    );
  }

  return false;
};
