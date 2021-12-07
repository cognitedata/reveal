import { BaseButton } from './BaseButton';
import {
  OPERATOR_BUTTON_SIZE,
  OPERATOR_BUTTON_TYPE,
  PLUS_BUTTON_TOOLTIP,
} from './constants';
import { ExtendedButtonProps } from './types';

export const PlusButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    size={OPERATOR_BUTTON_SIZE}
    type={OPERATOR_BUTTON_TYPE}
    icon="Add"
    tooltip={PLUS_BUTTON_TOOLTIP}
    aria-label="Plus"
    {...props}
  />
);
