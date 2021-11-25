import React from 'react';

import { Menu } from '@cognite/cogs.js';

import { FavoriteSummary } from 'modules/favorite/types';
import { FAVORITE_ON_ICON } from 'pages/authorized/search/map/constants';

export interface Props {
  favoriteSets: FavoriteSummary[];
  itemExistsInSets?: string[];
  handleSelectFavorite: (item: FavoriteSummary) => void;
}
export const FavoriteMenuItems: React.FC<Props> = ({
  handleSelectFavorite,
  itemExistsInSets,
  favoriteSets,
}) => {
  if (!favoriteSets) return null;

  return (
    <>
      {favoriteSets.map((item) => {
        const isAlreadyFavored =
          itemExistsInSets &&
          itemExistsInSets.some((favoriteId) => favoriteId === item.id);
        return (
          <Menu.Item
            key={item.id}
            onClick={() => handleSelectFavorite(item)}
            disabled={isAlreadyFavored}
            appendIcon={(isAlreadyFavored && FAVORITE_ON_ICON) || undefined}
          >
            {item.name}
          </Menu.Item>
        );
      })}
    </>
  );
};
