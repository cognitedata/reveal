import { BaseButton } from './BaseButton';
import { BACK_BUTTON_TOOLTIP } from './constants';
import { ExtendedButtonProps } from './types';

export const BackButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    icon="ArrowLeft"
    tooltip={BACK_BUTTON_TOOLTIP}
    aria-label="Go back"
    {...props}
  />
);
