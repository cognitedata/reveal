import { BaseButton } from './BaseButton';
import { ExtendedButtonProps } from './types';

export const MoreOptionsButton: React.FC<ExtendedButtonProps> = ({
  ...props
}) => (
  <BaseButton
    size="small"
    type="secondary"
    icon="MoreOverflowEllipsisHorizontal"
    aria-label="More options"
    {...props}
  />
);
