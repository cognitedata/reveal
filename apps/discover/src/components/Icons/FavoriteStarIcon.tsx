import { Icon } from '@cognite/cogs.js';

import { FavoriteIndicatorContainer } from 'pages/authorized/search/elements';

export const FavoriteStarIcon = () => {
  return (
    <FavoriteIndicatorContainer>
      <Icon data-testid="favorite-star-icon" type="FavoriteFilled" />
    </FavoriteIndicatorContainer>
  );
};
