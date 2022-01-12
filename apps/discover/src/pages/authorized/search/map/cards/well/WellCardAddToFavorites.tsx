import { Button, Dropdown } from '@cognite/cogs.js';

import AddToFavoriteSetMenu from 'components/add-to-favorite-set-menu';
import { Well } from 'modules/wellSearch/types';

import { FAVORITE_OFF_ICON } from '../../constants';

interface props {
  well: Well | null;
}
export const WellCardAddToFavorites: React.FC<props> = ({ well }) => {
  // This was not working, don't know if it needs to be enabled
  // const [isFavored, setFavored] = useState<boolean>(false);

  if (!well) {
    return null;
  }

  return (
    <Dropdown content={<AddToFavoriteSetMenu wells={{ [well.id]: [] }} />}>
      <Button
        type="ghost"
        icon={FAVORITE_OFF_ICON}
        iconPlacement="right"
        aria-label="Open favorites dropdown"
      />
    </Dropdown>
  );
};
