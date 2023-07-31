import { BaseButton } from './BaseButton';
import { CLOSE_BUTTON_TOOLTIP } from './constants';
import { ExtendedButtonProps } from './types';

export const CloseButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    icon="Close"
    tooltip={CLOSE_BUTTON_TOOLTIP}
    aria-label="Close"
    {...props}
  />
);
