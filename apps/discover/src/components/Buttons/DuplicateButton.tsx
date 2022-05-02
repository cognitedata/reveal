import { BaseButton } from './BaseButton';
import { DUPLICATE_BUTTON_TOOLTIP } from './constants';
import { ExtendedButtonProps } from './types';

export const DuplicateButton: React.FC<ExtendedButtonProps> = ({
  ...props
}) => (
  <BaseButton
    size="small"
    icon="Duplicate"
    tooltip={DUPLICATE_BUTTON_TOOLTIP}
    aria-label="Duplicate"
    {...props}
  />
);
