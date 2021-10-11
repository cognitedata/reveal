import { BaseButton } from './BaseButton';
import { HIDE_BUTTON_TEXT } from './constants';
import { ExtendedButtonProps } from './types';

export const HideButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    type="secondary"
    icon="PanelLeft"
    text={HIDE_BUTTON_TEXT}
    aria-label="Hide"
    {...props}
  />
);
