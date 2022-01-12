import React, { useEffect, useMemo, useState } from 'react';

import { Menu } from '@cognite/cogs.js';
import { FavoriteContent } from '@cognite/discover-api-types';

import { FAVORITE_ON_ICON } from 'pages/authorized/search/map/constants';

export interface Props {
  favoriteName: string;
  isFavored: boolean;
  onItemClicked: (content: FavoriteContent) => void;
  favoriteContent: FavoriteContent;
}
export const FavoriteMenuItem: React.FC<Props> = ({
  isFavored,
  favoriteName,
  favoriteContent,
  onItemClicked,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isFavored) {
      setLoading(false);
    }
  }, [isFavored]);

  return useMemo(() => {
    return (
      <Menu.Item
        onClick={() => {
          onItemClicked(favoriteContent);
          setLoading(true);
        }}
        disabled={loading || isFavored}
        appendIcon={
          loading ? 'Loader' : (isFavored && FAVORITE_ON_ICON) || undefined
        }
      >
        {favoriteName}
      </Menu.Item>
    );
  }, [isFavored, loading, favoriteContent]);
};
