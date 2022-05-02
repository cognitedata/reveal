import { BaseButton } from './BaseButton';
import { EDIT_BUTTON_TOOLTIP } from './constants';
import { ExtendedButtonProps } from './types';

export const EditButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    size="small"
    icon="Edit"
    tooltip={EDIT_BUTTON_TOOLTIP}
    aria-label="Edit"
    {...props}
  />
);
