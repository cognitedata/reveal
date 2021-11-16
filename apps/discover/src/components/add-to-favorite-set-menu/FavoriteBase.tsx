import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import merge from 'lodash/merge';

import { Icon, Menu } from '@cognite/cogs.js';

import { CloseButton } from 'components/buttons';
import { showSuccessMessage } from 'components/toast';
import { useFavoritesGetAllQuery } from 'modules/api/favorites/useFavoritesQuery';
import {
  setItemsToAddAfterFavoriteCreation,
  showCreateFavoriteSetModal,
} from 'modules/favorite/actions';
import { WellId } from 'modules/wellSearch/types';
import { InlineFlex, RightAlignedSmall } from 'styles/layout';

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
  itemExistsInSets?: string[];
  callBackModal?: () => void;
}

export const FavoriteBase: React.FC<Props> = ({
  documentIds,
  wellIds,
  itemExistsInSets,
  callBackModal,
}) => {
  const dispatch = useDispatch();
  const { data: favorites } = useFavoritesGetAllQuery();
  const { t } = useTranslation();
  const { handleFavoriteUpdate } = useHandleSelectFavourite();

  const handleSelectFavourite = (setId: string) => {
    const favorite = favorites?.find((favorite) => favorite.id === setId);

    const wells =
      favorite && wellIds.length
        ? merge(
            { ...favorite.content.wells },
            ...wellIds.map((wellId) => ({ [wellId]: [] }))
          )
        : undefined;

    handleFavoriteUpdate(
      setId,
      documentIds,
      wells,
      () => showSuccessMessage(t(NOTIFICATION_MESSAGE)),
      () => showSuccessMessage(t(NOTIFICATION_MESSAGE))
    );
  };

  const handleOpenCreateFavourite = () => {
    if (callBackModal) {
      callBackModal();
    }

    dispatch(
      setItemsToAddAfterFavoriteCreation({
        documentIds:
          documentIds && documentIds.length ? documentIds : undefined,
        wells:
          wellIds && wellIds.length
            ? wellIds.reduce(
                (previousValue, currentValue) => ({
                  ...previousValue,
                  [currentValue]: [],
                }),
                {}
              )
            : undefined,
      })
    );
    dispatch(showCreateFavoriteSetModal());
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
        favouriteSets={favorites || []}
        itemExistsInSets={itemExistsInSets}
        handleSelectFavourite={(item) => handleSelectFavourite(item.id)}
      />
      {favorites && favorites.length > 0 && (
        <Menu.Divider data-testid="menu-divider" />
      )}
      <Menu.Item onClick={handleOpenCreateFavourite}>
        <Icon type="PlusCompact" />
        {t(CREATE_NEW_SET)}
      </Menu.Item>
    </Menu>
  );
};
