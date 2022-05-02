import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { batch, useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import { mergeUniqueArray } from 'utils/merge';

import { Icon, Menu } from '@cognite/cogs.js';
import { FavoriteContent } from '@cognite/discover-api-types';

import { useDeepCallback } from '../../hooks/useDeep';
import {
  setItemsToAddOnFavoriteCreation,
  showCreateFavoriteModal,
} from '../../modules/favorite/reducer';
import {
  FavoriteContentWells,
  FavoriteSummary,
} from '../../modules/favorite/types';
import { useFavoritesSortedByName } from '../../services/favorites/useFavoritesQuery';
import { showSuccessMessage } from '../Toast';

import { CREATE_NEW_SET, NOTIFICATION_MESSAGE } from './constants';
import { FavoriteMenuItemWrapper } from './element';
import { FavoriteMenuItem } from './FavoriteMenuItem';
import { isSetFavoredInDocuments, isSetFavoredInWells } from './helpers';
import { useHandleSelectFavourite } from './useFavorite';

export interface Props {
  documentIds?: number[];
  wells?: FavoriteContentWells;
}
export const AddToFavoriteSetMenu: React.FC<Props> = ({
  documentIds = [],
  wells,
}) => {
  const { data: favorites } = useFavoritesSortedByName();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { handleFavoriteUpdate } = useHandleSelectFavourite();

  const wellsRef = useRef<FavoriteContentWells | undefined>(undefined);
  const documentsRef = useRef<number[] | undefined>(undefined);

  const handleOpenCreateFavorite = () => {
    batch(() => {
      if (!isEmpty(documentIds) || !isEmpty(wells)) {
        dispatch(
          setItemsToAddOnFavoriteCreation({
            documentIds,
            wells,
          })
        );
      }
      dispatch(showCreateFavoriteModal());
    });
  };

  useEffect(() => {
    wellsRef.current = wells;
  }, [wells]);

  useEffect(() => {
    documentsRef.current = documentIds;
  }, [documentIds]);

  const isDocumentFavored = useDeepCallback(
    (favorite: FavoriteSummary) => {
      return isSetFavoredInDocuments(documentIds, favorite.content.documentIds);
    },
    [documentIds]
  );

  const isWellFavored = useDeepCallback(
    (favorite: FavoriteSummary) => {
      return isSetFavoredInWells(wells, favorite.content.wells);
    },
    [wells]
  );

  const handleSelectFavorite = (
    favoriteId: string,
    favoriteContent: FavoriteContent
  ) => {
    const wellsFinal = wellsRef.current
      ? mergeUniqueArray({ ...favoriteContent.wells }, { ...wellsRef.current })
      : undefined;

    handleFavoriteUpdate(
      favoriteId,
      documentsRef.current,
      wellsFinal,
      () => showSuccessMessage(t(NOTIFICATION_MESSAGE)),
      () => showSuccessMessage(t(NOTIFICATION_MESSAGE))
    );
  };

  return (
    <Menu data-testid="add-to-favorites-panel">
      <FavoriteMenuItemWrapper>
        {(favorites || []).map((item) => {
          return (
            <FavoriteMenuItem
              key={item.id}
              favoriteName={item.name}
              isFavored={isDocumentFavored(item) || isWellFavored(item)}
              favoriteContent={item.content}
              onItemClicked={(favoriteContent) => {
                handleSelectFavorite(item.id, favoriteContent);
              }}
            />
          );
        })}
      </FavoriteMenuItemWrapper>

      {!isEmpty(favorites) && <Menu.Divider data-testid="menu-divider" />}
      <Menu.Item onClick={handleOpenCreateFavorite}>
        <Icon type="Add" />
        {t(CREATE_NEW_SET)}
      </Menu.Item>
    </Menu>
  );
};
