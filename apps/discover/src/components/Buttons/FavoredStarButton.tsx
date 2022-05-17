import { FAVORITE_ON_ICON } from 'pages/authorized/search/map/constants';

import { BaseButton } from './BaseButton';
import { ExtendedButtonProps } from './types';

export const FavoredStarButton: React.FC<ExtendedButtonProps> = ({
  onClick,
  iconPlacement,
  title,
  ...props
}) => {
  return (
    <BaseButton
      type="link"
      icon={FAVORITE_ON_ICON}
      title={title || FAVORITE_ON_ICON}
      iconPlacement={iconPlacement || 'right'}
      data-testid="favourite-select-icon-button"
      aria-label="Open favorites dropdown"
      onClick={onClick}
      {...props}
    />
  );
};
