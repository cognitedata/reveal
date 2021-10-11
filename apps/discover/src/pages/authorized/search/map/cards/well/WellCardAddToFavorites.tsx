import { useState } from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { Well } from 'modules/wellSearch/types';

import { FAVORITE_OFF_ICON, FAVORITE_ON_ICON } from '../../constants';

interface props {
  well: Well | null;
}
export const WellCardAddToFavorites: React.FC<props> = (prop) => {
  const { well } = prop;
  const [isFavored, setFavored] = useState<boolean>(false);

  return (
    <Dropdown
      content={
        <AddToFavoriteSetMenu
          wellIds={[Number(well?.id)]}
          setFavored={setFavored}
        />
      }
    >
      <Button
        type="ghost"
        icon={isFavored ? FAVORITE_ON_ICON : FAVORITE_OFF_ICON}
        iconPlacement="right"
        aria-label="Open favorites dropdown"
      />
    </Dropdown>
  );
};
