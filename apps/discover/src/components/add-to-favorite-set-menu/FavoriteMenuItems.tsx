import React from 'react';

import { Menu } from '@cognite/cogs.js';

import { FavoriteSummary } from 'modules/favorite/types';
import { FAVORITE_ON_ICON } from 'pages/authorized/search/map/constants';

export interface Props {
  favouriteSets: FavoriteSummary[];
  itemExistsInSets?: string[];
  handleSelectFavourite: (item: FavoriteSummary) => void;
}
export const FavoriteMenuItems: React.FC<Props> = ({
  handleSelectFavourite,
  itemExistsInSets,
  favouriteSets,
}) => {
  if (!favouriteSets) return null;
  return (
    <>
      {favouriteSets.map((item) => {
        const isAlreadyFavored =
          itemExistsInSets &&
          itemExistsInSets.some((favoriteId) => favoriteId === item.id);
        return (
          <Menu.Item
            key={item.id}
            onClick={() => handleSelectFavourite(item)}
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
