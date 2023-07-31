import { FAVORITE_OFF_ICON } from 'pages/authorized/search/map/constants';

import { BaseButton } from './BaseButton';
import { ExtendedButtonProps } from './types';

export const FavoriteButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    variant="inverted"
    icon={FAVORITE_OFF_ICON}
    aria-label="Favorite all button"
    {...props}
  />
);
