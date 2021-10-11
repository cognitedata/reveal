import { BaseButton } from './BaseButton';
import { ExtendedButtonProps } from './types';

export const ExpandButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    type="secondary"
    icon="ChevronDownCompact"
    iconPlacement="right"
    aria-label="Expand"
    {...props}
  />
);
