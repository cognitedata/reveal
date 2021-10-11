import { BaseButton } from './BaseButton';
import { SHARE_BUTTON_TOOLTIP } from './constants';
import { ExtendedButtonProps } from './types';

export const ShareButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    size="small"
    icon="Share"
    tooltip={SHARE_BUTTON_TOOLTIP}
    aria-label="Share"
    {...props}
  />
);
