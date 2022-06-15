import { Button } from '@cognite/cogs.js';

import { FavoriteContentWells } from 'modules/favorite/types';
import { WellId, WellboreId } from 'modules/wellSearch/types';
import { isWellboreFavored } from 'modules/wellSearch/utils/isWellboreFavored';
import { FavoriteDropdown } from 'pages/authorized/search/common/FavoriteDropdown';

export const WellboreDetailIcon: React.FC<{
  favoriteWellIds: FavoriteContentWells;
  wellId: WellId;
  wellboreId: WellboreId;
  navigateInspect: (wellboreId: WellboreId) => void;
}> = ({ favoriteWellIds, wellId, wellboreId, navigateInspect }) => {
  const isFavored = isWellboreFavored(favoriteWellIds, wellId, wellboreId);

  return (
    <>
      <Button
        aria-label="Wellbore button"
        type="ghost"
        icon="ArrowRight"
        onClick={() => navigateInspect(wellboreId)}
      />
      <FavoriteDropdown
        isFavored={isFavored}
        well={{ [wellId]: [wellboreId] }}
      />
    </>
  );
};
