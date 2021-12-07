import { BaseButton } from './BaseButton';
import {
  OPERATOR_BUTTON_SIZE,
  OPERATOR_BUTTON_TYPE,
  MINUS_BUTTON_TOOLTIP,
} from './constants';
import { ExtendedButtonProps } from './types';

export const MinusButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    size={OPERATOR_BUTTON_SIZE}
    type={OPERATOR_BUTTON_TYPE}
    icon="Minus"
    tooltip={MINUS_BUTTON_TOOLTIP}
    aria-label="Minus"
    {...props}
  />
);
