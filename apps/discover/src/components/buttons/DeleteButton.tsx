import { BaseButton } from './BaseButton';
import { DELETE_BUTTON_TOOLTIP } from './constants';
import { ExtendedButtonProps } from './types';

export const DeleteButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    size="small"
    type="ghost-danger"
    icon="Delete"
    tooltip={DELETE_BUTTON_TOOLTIP}
    aria-label="Delete"
    {...props}
  />
);
