import React from 'react';

import { useFavoritesGetAllQuery } from 'modules/api/favorites/useFavoritesQuery';
import {
  getDocumentIds,
  getWellbores,
  getWellIds,
} from 'modules/favorite/utils';
import { WellboreId, WellId } from 'modules/wellSearch/types';

import { FavoriteBase } from './FavoriteBase';
import {
  useDocumentExistInFavorite,
  useWellExistInFavorite,
} from './useFavorite';

interface Props {
  documentId: number;
  wellId: WellId;
  wellboreId?: WellboreId;
  callBackModal?: () => void;
}
export const AddSingleItem: React.FC<Props> = ({
  documentId,
  wellId,
  wellboreId,
  callBackModal,
}) => {
  const { data: favorites } = useFavoritesGetAllQuery('name');
  const fileExistsInSet = useDocumentExistInFavorite(
    favorites || [],
    documentId
  );

  const wellExistsInSet = useWellExistInFavorite(
    favorites || [],
    wellId,
    wellboreId
  );

  const documents = getDocumentIds(documentId);
  const wells = getWellIds(wellId);
  const wellbores = getWellbores(wellboreId);

  return (
    <FavoriteBase
      documentIds={documents}
      wellIds={wells}
      wellboreIds={wellbores}
      itemExistsInSets={documentId ? fileExistsInSet : wellExistsInSet}
      callBackModal={callBackModal}
    />
  );
};
