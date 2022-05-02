import { BaseButton } from './BaseButton';
import { VIEW_BUTTON_TEXT } from './constants';
import { ExtendedButtonProps } from './types';

export const ViewButton: React.FC<ExtendedButtonProps> = ({
  hideIcon,
  ...rest
}) => (
  <BaseButton
    size="small"
    type="primary"
    text={VIEW_BUTTON_TEXT}
    icon={hideIcon ? undefined : 'ArrowUpRight'}
    iconPlacement="right"
    aria-label="View"
    {...rest}
  />
);
