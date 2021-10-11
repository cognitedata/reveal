import { BaseButton } from './BaseButton';
import { SEARCH_BUTTON_TOOLTIP } from './constants';
import { ExtendedButtonProps } from './types';

export const SearchButton: React.FC<ExtendedButtonProps> = ({ ...props }) => (
  <BaseButton
    type="primary"
    icon="Search"
    tooltip={SEARCH_BUTTON_TOOLTIP}
    aria-label="Search"
    {...props}
  />
);
