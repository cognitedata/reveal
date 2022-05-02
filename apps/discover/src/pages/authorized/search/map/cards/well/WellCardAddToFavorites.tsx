import { Button, Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/AddToFavoriteSetMenu';
import { Well } from 'modules/wellSearch/types';

import { FAVORITE_OFF_ICON, FAVORITE_ON_ICON } from '../../constants';

interface props {
  well: Well | null;
  isFavored: boolean;
}
export const WellCardAddToFavorites: React.FC<props> = ({
  well,
  isFavored,
}) => {
  // This was not working, don't know if it needs to be enabled
  // const [isFavored, setFavored] = useState<boolean>(false);

  if (!well) {
    return null;
  }

  return (
    <Dropdown content={<AddToFavoriteSetMenu wells={{ [well.id]: [] }} />}>
      <Button
        type={isFavored ? 'link' : 'ghost'}
        icon={isFavored ? FAVORITE_ON_ICON : FAVORITE_OFF_ICON}
        iconPlacement="right"
        aria-label="Open favorites dropdown"
      />
    </Dropdown>
  );
};
