import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Icon, Menu } from '@cognite/cogs.js';

import { CloseButton } from 'components/buttons';
import { showSuccessMessage } from 'components/toast';
import {
  showCreateFavoriteModal,
  setItemsToAddAfterFavoriteIsCreated,
} from 'modules/favorite/reducer';
import { FavoriteContentWells } from 'modules/favorite/types';
import {
  getDocumentsToAddAfterFavoriteCreation,
  getUpdatedWells,
  getWellsToAddAfterFavoriteCreation,
} from 'modules/favorite/utils';
import { WellboreId, WellId } from 'modules/wellSearch/types';
import { InlineFlex, RightAlignedSmall } from 'styles/layout';

import { useFavoritesSortedByName } from '../../modules/api/favorites/useFavoritesQuery';

import {
  ADD_TO_FAVOURITES,
  CREATE_NEW_SET,
  NOTIFICATION_MESSAGE,
} from './constants';
import { FavoriteMenuItems } from './FavoriteMenuItems';
import { useHandleSelectFavourite } from './useFavorite';

export interface Props {
  documentIds: number[];
  wellIds: WellId[];
  wellboreIds?: WellboreId[];
  itemExistsInSets?: string[];
  callBackModal?: () => void;
}

export const FavoriteBase: React.FC<Props> = ({
  documentIds,
  wellIds,
  wellboreIds = [],
  itemExistsInSets,
  callBackModal,
}) => {
  const dispatch = useDispatch();
  const { data: favorites } = useFavoritesSortedByName();
  const { t } = useTranslation();
  const { handleFavoriteUpdate } = useHandleSelectFavourite();

  const handleSelectFavorite = (setId: string) => {
    const wells: FavoriteContentWells = getUpdatedWells(
      favorites,
      wellIds,
      wellboreIds,
      setId
    );

    handleFavoriteUpdate(
      setId,
      documentIds,
      wells,
      () => showSuccessMessage(t(NOTIFICATION_MESSAGE)),
      () => showSuccessMessage(t(NOTIFICATION_MESSAGE))
    );
  };

  const handleOpenCreateFavorite = () => {
    if (callBackModal) {
      callBackModal();
    }

    dispatch(
      setItemsToAddAfterFavoriteIsCreated({
        documentIds: getDocumentsToAddAfterFavoriteCreation(documentIds),
        wells: getWellsToAddAfterFavoriteCreation(wellIds),
      })
    );
    dispatch(showCreateFavoriteModal());
  };

  return (
    <Menu data-testid="add-to-favorites-panel">
      {callBackModal && (
        <InlineFlex>
          <Menu.Header>{t(ADD_TO_FAVOURITES)}</Menu.Header>
          <RightAlignedSmall>
            <CloseButton
              size="small"
              type="secondary"
              onClick={callBackModal}
            />
          </RightAlignedSmall>
        </InlineFlex>
      )}
      <FavoriteMenuItems
        favoriteSets={favorites || []}
        itemExistsInSets={itemExistsInSets}
        handleSelectFavorite={(item) => handleSelectFavorite(item.id)}
      />
      {favorites && favorites.length > 0 && (
        <Menu.Divider data-testid="menu-divider" />
      )}
      <Menu.Item onClick={handleOpenCreateFavorite}>
        <Icon type="Add" />
        {t(CREATE_NEW_SET)}
      </Menu.Item>
    </Menu>
  );
};
