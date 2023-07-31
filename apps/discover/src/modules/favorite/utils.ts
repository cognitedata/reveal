import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';

import {
  FavoriteContentWells,
  FavoriteSummary,
  LastUpdatedBy,
} from 'modules/favorite/types';
import { getFullNameOrDefaultText } from 'modules/user/utils';
import { WellboreId, WellId } from 'modules/wellSearch/types';

const getFavoriteLastUpdateByUserName = (data: LastUpdatedBy[]) => {
  return getFullNameOrDefaultText(data[data.length - 1]);
};

const getFavoriteLastUpdatedByDateTime = (data: LastUpdatedBy[]) => {
  return data[data.length - 1]?.dateTime;
};

export { getFavoriteLastUpdateByUserName, getFavoriteLastUpdatedByDateTime };

export const getWellIds = (wellId?: WellId): WellId[] =>
  wellId ? [wellId] : [];

export const getDocumentIds = (documentId?: number): number[] =>
  documentId ? [documentId] : [];

export const getWellbores = (wellboreId: WellboreId): WellboreId[] =>
  wellboreId ? [wellboreId] : [];

// const isWellInFavoriteContentWells = (
//   wells: FavoriteContentWells,
//   wellId: WellId
// ): boolean => {
//   return Object.keys(wells).includes(wellId);
// };

// const isWellboreIdInFavoriteContentWellbores = (
//   wells: FavoriteContentWells,
//   wellboreId: WellboreId
// ): boolean => {
//   return (
//     !isUndefined(wellboreId) &&
//     !isEmpty(
//       Object.values(wells).filter((wellbore) => wellbore.includes(wellboreId))
//     )
//   );
// };

// const checkWellboreIdAndFavoriteWellcontent = (
//   wellboreId: WellboreId,
//   wells: FavoriteContentWells,
//   wellboreList: string[]
// ): boolean => {
//   return (
//     /* wellbore id will undefined when adding entire well */
//     isUndefined(wellboreId) ||
//     isWellboreIdInFavoriteContentWellbores(wells, wellboreId) ||
//     /* if a well with all wellbores denoted as empty wellbore array */
//     isEmpty(wellboreList)
//   );
// };

export const getDocumentExistInFavorite = (
  favorites: FavoriteSummary[],
  documentId: number
): string[] => {
  return favorites
    .filter((favorite) =>
      favorite.content.documentIds.includes(Number(documentId))
    )
    .map((favorite) => favorite.id);
};

export const getUpdatedWells = (
  favorites: FavoriteSummary[] | undefined,
  wellIds: WellId[],
  wellboreIds: WellboreId[],
  setId: string
): FavoriteContentWells => {
  const favorite = favorites?.find((favorite) => favorite.id === setId);
  return favorite && wellIds.length
    ? merge(
        { ...favorite.content.wells },
        ...wellIds.map((wellId) => ({
          [wellId]: favorite.content.wells[wellId]
            ? {
                ...favorite.content.wells[wellId].concat(wellboreIds),
              }
            : wellboreIds,
        }))
      )
    : undefined;
};

export const getWellsToAddAfterFavoriteCreation = (
  wellIds: WellId[]
): FavoriteContentWells => {
  if (isEmpty(wellIds)) {
    return {};
  }

  return wellIds.reduce(
    (previousValue, currentValue) => ({
      ...previousValue,
      [currentValue]: [],
    }),
    {}
  );
};

export const getDocumentsToAddAfterFavoriteCreation = (
  documentIds: number[]
) => {
  return documentIds && documentIds.length ? documentIds : undefined;
};
