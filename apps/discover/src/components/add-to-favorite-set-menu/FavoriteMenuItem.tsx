import React, { useEffect, useMemo, useState } from 'react';

import { FavoriteContent } from '@cognite/discover-api-types';

import { MiddleEllipsis } from 'components/middle-ellipsis/MiddleEllipsis';
import { FAVORITE_ON_ICON } from 'pages/authorized/search/map/constants';
import { MenuItemWrapper } from 'pages/authorized/search/search/SavedSearches/elements';

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
      <MenuItemWrapper
        onClick={() => {
          onItemClicked(favoriteContent);
          setLoading(true);
        }}
        disabled={loading || isFavored}
        appendIcon={
          loading ? 'Loader' : (isFavored && FAVORITE_ON_ICON) || undefined
        }
      >
        <MiddleEllipsis value={favoriteName} fixedLength={25} />
      </MenuItemWrapper>
    );
  }, [isFavored, loading, favoriteContent]);
};
