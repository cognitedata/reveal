import { Button } from '@cognite/cogs.js';

import { FavoriteContentWells } from 'modules/favorite/types';
import { WellId, WellboreId } from 'modules/wellSearch/types';
import { isWellboreFavored } from 'modules/wellSearch/utils/isWellboreFavored';

import { FAVORITE_ON_ICON } from '../../constants';

import { WellboreButton } from './elements';

export const WellboreDetailIcon: React.FC<{
  favoriteWellIds: FavoriteContentWells;
  wellId: WellId;
  wellboreId: WellboreId;
}> = ({ favoriteWellIds, wellId, wellboreId }) => {
  const isFavored = isWellboreFavored(favoriteWellIds, wellId, wellboreId);

  if (isFavored)
    return <Button type="link" icon={FAVORITE_ON_ICON} iconPlacement="right" />;

  return (
    <WellboreButton
      aria-label="Wellbore button"
      type="ghost"
      icon="ArrowRight"
    />
  );
};
