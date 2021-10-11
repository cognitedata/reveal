import React from 'react';

import { useFavoritesGetAllQuery } from 'modules/api/favorites/useFavoritesQuery';

import { FavoriteBase } from './FavoriteBase';
import {
  getDocumentIds,
  getWellIds,
  useDocumentExistInFavorite,
  useWellExistInFavorite,
} from './useFavorite';

interface Props {
  documentId: number;
  wellId: number;
  callBackModal?: () => void;
}
export const AddSingleItem: React.FC<Props> = ({
  documentId,
  wellId,
  callBackModal,
}) => {
  const { data: favorites } = useFavoritesGetAllQuery();
  const fileExistsInSet = useDocumentExistInFavorite(
    favorites || [],
    documentId
  );
  const wellExistsInSet = useWellExistInFavorite(favorites || [], wellId);

  const documents = getDocumentIds(documentId);
  const wells = getWellIds(wellId);

  return (
    <FavoriteBase
      documentIds={documents}
      wellIds={wells}
      itemExistsInSets={documentId ? fileExistsInSet : wellExistsInSet}
      callBackModal={callBackModal}
    />
  );
};
